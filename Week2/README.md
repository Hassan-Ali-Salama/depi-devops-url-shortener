
# 🧱 Week 2 – DevOps DEPI Project

## 📊 Monitoring the URL Shortener with Prometheus

This week focuses on **instrumenting and monitoring** the URL Shortener application using **Prometheus**.
The goal is to expose custom metrics from the Node.js service, configure Prometheus to scrape them, and run both services through Docker Compose.

---

## 🎯 **Objectives**

During Week 2, the following tasks were completed:

* Added **custom Prometheus metrics** to the webservice.
* Created a `/metrics` endpoint to export the metrics.
* Implemented metrics using the **prom-client** library.
* Created `prometheus.yml` to configure Prometheus scraping.
* Added a Prometheus service inside **docker-compose.yml**.
* Verified that Prometheus successfully collects all metrics.

---

## 🧰 **Technology Stack**

| Component        | Technology             |
| ---------------- | ---------------------- |
| Metrics Exporter | prom-client (Node.js)  |
| Monitoring       | Prometheus             |
| Containers       | Docker, Docker Compose |
| Backend          | Node.js + Express      |

---

## 📊 **Custom Metrics Implemented**

The following metrics were implemented inside the Node.js application:

### 🔹 1. Counter – URLs Successfully Created

```
url_shortener_created_total
```

### 🔹 2. Counter – Successful Redirects

```
url_shortener_redirect_total
```

### 🔹 3. Counter – Failed Lookups (404)

```
url_shortener_not_found_total
```

### 🔹 4. Histogram – Request Latency (seconds)

```
url_shortener_request_latency_seconds
```

These metrics help track performance, usage behavior, and potential issues inside the app.

---

## 🗂️ **Updated File Structure**

```
Week2/
├── app.js                # Updated with Prometheus instrumentation
├── prometheus.yml        # Prometheus configuration
└── docker-compose.yml    # App + Prometheus services
```

---

## ⚙️ **Run Locally (without Docker)**

```bash
# 1️⃣ Install dependencies
npm install
npm install prom-client

# 2️⃣ Start the server
node app.js

# 3️⃣ Test metrics
curl http://localhost:3000/metrics

# 4️⃣ Create a short URL
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'
```

---

## 🐳 **Run Using Docker Compose**

```bash
docker compose up --build -d
```

### ✔ Services Included

| Service        | Description                   |
| -------------- | ----------------------------- |
| **web**        | The URL Shortener application |
| **prometheus** | The monitoring service        |

---

## 🐳 **docker-compose.yml Overview**

```yaml
services:
  web:
    build: .
    image: hassanalisalama/url-shortener:V1.0
    ports:
      - "3000:3000"
    volumes:
      - ./db:/app/db
    environment:
      - PORT=3000
      - DB_FILE=/app/db/data.sqlite
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:v2.50.0
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
    depends_on:
      - web
    restart: unless-stopped
```

---

## 📡 **prometheus.yml Overview**

```yaml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: 'url_shortener'
    metrics_path: /metrics
    static_configs:
      - targets: ['web:3000']
```

---

## 🔍 **Testing Metrics**

### ✔ View All Metrics:

```
http://localhost:3000/metrics
```

### ✔ Open Prometheus UI:

```
http://localhost:9090
```

### ✔ Example PromQL Queries:

```
url_shortener_created_total
url_shortener_redirect_total
url_shortener_not_found_total
url_shortener_request_latency_seconds_count
```

---

## 🧠 **What Was Achieved in Week 2**

* Successfully instrumented the application with Prometheus metrics.
* Implemented and exposed a fully working `/metrics` endpoint.
* Configured Prometheus to scrape metrics from the Node.js service.
* Integrated both services in Docker Compose.
* Verified that all metrics are visible inside Prometheus UI.

Fully ready for **Week 3 → Grafana Dashboards** 🎉

---

## 👨‍💻 Author

**Hassan Ali Salama**  
🎓 Digital Egypt Pioneers Initiative – DevOps Track  
🔗 [GitHub Profile](https://github.com/Hassan-Ali-Salama)
