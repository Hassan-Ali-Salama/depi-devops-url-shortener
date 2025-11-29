# URL Shortener Project

This project is a simple URL shortener service built with **Node.js**, **Express**, and **SQLite**, with monitoring using **Prometheus** and **Grafana**.

---

## Table of Contents

- [Requirements](#requirements)  
- [Setup & Run](#setup--run)  
- [API Endpoints](#api-endpoints)  
- [Monitoring](#monitoring)    

---

## Requirements

- Docker & Docker Compose  
- Node.js (for local dev)  
- Git  

---

## Setup & Run

1. **Clone the repository:**

```bash
git clone <your-repo-url>
cd depi-devops-url-shortener

Start the services:

docker compose up --build -d


Check services:

URL Shortener app: http://localhost:3000

Grafana dashboard: http://localhost:3001

Prometheus: http://localhost:9090

Stop services:

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

2. List all URLs
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

3. Delete a URL
DELETE /api/urls/:code


Headers:

X-Owner-Id: <ownerId>


Response:

{ "deleted": true }


Only the owner can delete their URL. Global entries with null owner_id cannot be deleted.

4. Redirect to Original URL
GET /:code


Response:

Redirects to the original URL

Increments Prometheus metrics

5. Short URL Info Page
GET /s/:code


Response:

Simple HTML page showing URL creation date and original link

6. Metrics (Prometheus)
GET /metrics


Exposed Metrics:

url_shortener_created_total — number of URLs shortened

url_shortener_redirect_total — number of successful redirects

url_shortener_not_found_total — number of 404 lookups

url_shortener_request_latency_seconds — request latency histogram

Monitoring

Prometheus scrapes metrics from /metrics every 5 seconds

Grafana dashboards show:

Rate of URL creations & redirects

Total URLs

95th percentile latency

Rate of 404 errors

Alerts (Prometheus Alert Rules):

High 404 error rate

High 95th percentile latency

Low URL creation rate
