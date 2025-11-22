// app.js
const express = require('express');
const { nanoid } = require('nanoid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');


// ===== Prometheus =====
const client = require('prom-client');
//client.collectDefaultMetrics(); // system metrics (cpu/mem/etc)

// custom metrics
const shortenCounter = new client.Counter({
  name: 'url_shortener_created_total',
  help: 'Number of URLs shortened'
});

const redirectCounter = new client.Counter({
  name: 'url_shortener_redirect_total',
  help: 'Number of successful redirects'
});

const notFoundCounter = new client.Counter({
  name: 'url_shortener_not_found_total',
  help: 'Number of failed lookups (404)'
});

const requestLatency = new client.Histogram({
  name: 'url_shortener_request_latency_seconds',
  help: 'Request latency in seconds',
  // choose suitable buckets (seconds)
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.5, 1, 2, 5]
});
// ======================




const PORT = process.env.PORT || 3000;
const DB_DIR = path.join(__dirname, 'db');
const DB_FILE = path.join(DB_DIR, 'data.sqlite');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) return console.error('DB open error:', err);
  console.log('SQLite DB opened:', DB_FILE);
});

// create table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    owner_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`);
});

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors()); // same origin in local, fine for dev
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// helper: validate URL
function isValidUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// Read owner ID from header 'x-owner-id' (frontend will set it)
function getOwnerId(req) {
  return req.header('x-owner-id') || null;
}

/**
 * POST /api/shorten
 * body: { url: "https://..." }
 * header: X-Owner-Id: <ownerId>  (optional)
 */
app.post('/api/shorten', (req, res) => {
    const timerEnd = requestLatency.startTimer(); // start latency timer //
  const { url } = req.body;
  const ownerId = getOwnerId(req);
  if (!url || typeof url !== 'string' || !isValidUrl(url)) {
      timerEnd();
    return res.status(400).json({ error: 'Invalid or missing "url". Use full URL with http/https.' });
  }

  const code = nanoid(7);
  const stmt = db.prepare('INSERT INTO urls (code, url, owner_id) VALUES (?, ?, ?)');
  stmt.run(code, url, ownerId, function(err) {
      timerEnd();
    if (err) {
      console.error('DB insert error:', err);
      return res.status(500).json({ error: 'database error' });
    }
    shortenCounter.inc(); // increment created counter //
    const short = `${req.protocol}://${req.get('host')}/${code}`;
    res.json({ id: this.lastID, code, short_url: short, url, owner_id: ownerId, created_at: new Date().toISOString() });
  });
  stmt.finalize();
});

/**
 * GET /api/urls
 * optional query: ?mine=true
 * header: X-Owner-Id: <ownerId>
 */
app.get('/api/urls', (req, res) => {
  const mine = req.query.mine === 'true';
  const ownerId = getOwnerId(req);

  if (mine) {
    if (!ownerId) return res.status(400).json({ error: 'owner id required for mine=true' });
    db.all('SELECT id, code, url, owner_id, created_at FROM urls WHERE owner_id = ? ORDER BY id DESC', [ownerId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'db error' });
      const result = rows.map(r => ({ ...r, short_url: `${req.protocol}://${req.get('host')}/${r.code}` }));
      res.json(result);
    });
  } else {
    // return all
    db.all('SELECT id, code, url, owner_id, created_at FROM urls ORDER BY id DESC', [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'db error' });
      const result = rows.map(r => ({ ...r, short_url: `${req.protocol}://${req.get('host')}/${r.code}` }));
      res.json(result);
    });
  }
});

/**
 * DELETE /api/urls/:code
 * header: X-Owner-Id: <ownerId>
 * Only owner can delete (if owner_id exists). If the record has null owner_id, reject delete for safety.
 */
app.delete('/api/urls/:code', (req, res) => {
  const code = req.params.code;
  const ownerId = getOwnerId(req);
  db.get('SELECT owner_id FROM urls WHERE code = ?', [code], (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!row) return res.status(404).json({ error: 'not found' });
    if (!row.owner_id) return res.status(403).json({ error: 'deletion not allowed for global entries' });
    if (!ownerId || ownerId !== row.owner_id) return res.status(403).json({ error: 'not allowed' });

    db.run('DELETE FROM urls WHERE code = ?', [code], function(err2) {
      if (err2) return res.status(500).json({ error: 'db error' });
      res.json({ deleted: true });
    });
  });
});

/**
 * Info page for the short code (clickable link to redirect)
 * GET /s/:code  -> simple info HTML
 */
app.get('/s/:code', (req, res) => {
  const code = req.params.code;
  db.get('SELECT url, created_at FROM urls WHERE code = ?', [code], (err, row) => {
    if (err) return res.status(500).send('Server error');
    if (!row) return res.status(404).send('Not found');
    res.send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width,initial-scale=1"/>
          <title>Short URL Info</title>
          <style>
            body{font-family:Inter,system-ui,Arial;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f0f4f8}
            .card{background:#fff;padding:24px;border-radius:12px;box-shadow:0 6px 20px rgba(18,38,63,0.08);max-width:520px;text-align:center}
            a.button{display:inline-block;margin-top:12px;padding:10px 18px;border-radius:8px;background:#0066cc;color:#fff;text-decoration:none}
            p.small{color:#666;font-size:14px}
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Short URL Info</h2>
            <p class="small">Created at: ${row.created_at}</p>
            <p>Original URL:</p>
            <p><a href="${row.url}" target="_blank" rel="noopener noreferrer">${row.url}</a></p>
            <a class="button" href="${row.url}">Visit Original ▶</a>
          </div>
        </body>
      </html>
    `);
  });
});


// metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});




/**
 * Redirect endpoint (actual redirect to original url)
 * GET /:code
 */
app.get('/:code', (req, res) => {
  const code = req.params.code;
  // block if path looks like static or api or s
  if (code === 'api' || code === 's' || code === 'public') return res.status(404).send('Not found');
   const timerEnd = requestLatency.startTimer(); //////////
  db.get('SELECT url FROM urls WHERE code = ?', [code], (err, row) => {

  timerEnd();

    if (err) return res.status(500).send('Server error');
     if (!row) {
      notFoundCounter.inc();
      return res.status(404).send('Not found');
    }
    redirectCounter.inc();
    res.redirect(row.url);
  });
});



// health
app.get('/health', (req,res) => res.json({status:'ok'}));

app.listen(PORT, () => console.log(`App listening on http://localhost:${PORT}`));

// graceful shutdown
process.on('SIGINT', () => {
  console.log('shutting down...');
  db.close(() => process.exit(0));
});
