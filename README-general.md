# URL Shortener Project

A simple URL shortener service built with **Node.js**, **Express**, and **SQLite**, monitored using **Prometheus** and **Grafana**.

---

## Table of Contents

- [Requirements](#requirements)  
- [Setup & Run](#setup--run)  
- [API Endpoints](#api-endpoints)  
- [Monitoring & Metrics](#monitoring--metrics)  
- [Prometheus Alerts](#prometheus-alerts)  
- [License](#license)  

---

## Requirements

- Docker & Docker Compose  
- Node.js (for local development)  
- Git  

---

## Setup & Run

1. **Clone the repository:**

```bash
git clone <your-repo-url>
cd depi-devops-url-shortener

2 .Start services:
docker compose up --build -d

3 .Check services:

URL Shortener app: http://localhost:3000

Grafana dashboard: http://localhost:3001

Prometheus: http://localhost:9090

4 .Stop services:
docker compose down

API Endpoints
1. Shorten a URL
POST /api/shorten


Body:

{
  "url": "https://example.com"
}


Headers (optional):

X-Owner-Id: <ownerId>


Response:

{
  "id": 1,
  "code": "abc1234",
  "short_url": "http://localhost:3000/abc1234",
  "url": "https://example.com",
  "owner_id": "<ownerId>",
  "created_at": "2025-11-29T18:00:00.000Z"
}

2. List URLs
GET /api/urls


Optional Query:

?mine=true


Headers:

X-Owner-Id: <ownerId>


Response:

[
  {
    "id": 1,
    "code": "abc1234",
    "short_url": "http://localhost:3000/abc1234",
    "url": "https://example.com",
    "owner_id": "<ownerId>",
    "created_at": "2025-11-29T18:00:00.000Z"
  }
]


mine=true returns only URLs created by the owner.

3. Delete a URL
DELETE /api/urls/:code


Headers:

X-Owner-Id: <ownerId>


Response:

{ "deleted": true }


Only the owner can delete their URLs. Global entries with null owner_id cannot be deleted.

4. Redirect to Original URL
GET /:code


Redirects to the original URL

Increments Prometheus metrics (url_shortener_redirect_total)

5. Short URL Info Page
GET /s/:code


Returns a simple HTML page showing creation date and original link.

6. Metrics for Prometheus
GET /metrics


Exposed Metrics:

url_shortener_created_total — number of URLs shortened

url_shortener_redirect_total — number of successful redirects

url_shortener_not_found_total — number of failed lookups (404)

url_shortener_request_latency_seconds — request latency histogram

Monitoring & Metrics

Prometheus scrapes /metrics every 5 seconds.

Grafana dashboard displays:

Rate of URL creations & redirects

Total URLs

95th percentile latency

Rate of 404 errors

Grafana URL: http://localhost:3001

Prometheus Alerts

Alert rules configured:

High 404 Rate

Expression: rate(url_shortener_not_found_total[2m]) > 0.1

Fired if 404s exceed 0.1/sec for 2 minutes

High 95th Percentile Latency

Expression: histogram_quantile(0.95, sum(rate(url_shortener_request_latency_seconds_bucket[2m])) by (le)) > 1

Fired if p95 latency exceeds 1 second

No New URLs

Expression: rate(url_shortener_created_total[10m]) < 0.01

Fired if no URLs are created in the past 10 minutes

License

MIT License


✅ This **covers everything for Week 4**: running the project, API docs, metrics, monitoring, and alerts.  
