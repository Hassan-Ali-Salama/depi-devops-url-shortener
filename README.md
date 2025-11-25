# Week 3 – DevOps DEPI Project

**By: Sama Salem**

## 📌 Introduction

In Week 3, we built a complete monitoring setup for the URL Shortener application using:

* Web Service (URL Shortener) on port 3000
* Prometheus for metric collection
* Grafana for dashboards and visualizations
* Docker Compose to manage all services

---

## 🚀 1. Running the Project with Docker Compose

The `docker-compose.yml` file contains three services:

### **1. web (URL Shortener App)**

* The main application
* Exposes the endpoint `/metrics`

### **2. prometheus**

* Scrapes metrics from:

  * `http://web:3000/metrics`

### **3. grafana**

* Provides dashboards and visualization tools

### ▶️ Start all services:

```
docker compose up -d
```

### ✔️ Check running containers:

```
docker compose ps
```

---

## 📊 2. Verifying Prometheus Functionality

Open Prometheus:

```
http://localhost:9090
```

Go to:

```
Status → Targets
```

You should see:

```
url_shortener (1/1 up)
```

The target exposes metrics such as:

* `url_shortener_created_total`
* `url_shortener_redirect_total`
* `url_shortener_not_found_total`
* `url_shortener_request_latency_seconds`

This confirms Prometheus is scraping the service correctly.

---

## 🎨 3. Connecting Grafana to Prometheus

Open Grafana:

```
http://localhost:3000
```

Default credentials:

```
admin / admin
```

Navigate to:

```
Connections → Data sources → Add data source → Prometheus
```

Set URL to:

```
http://prometheus:9090
```

Test connection:

```
Save & Test
```

You should see:

```
Successfully queried the Prometheus API
```

---

## 🔍 4. Querying Metrics Using Explore

Go to:

```
Explore
```

Enter any metric, for example:

```
url_shortener_created_total
```

Press Enter to view time-series results.

### Available Metrics:

| Metric                                | Description                      |
| ------------------------------------- | -------------------------------- |
| url_shortener_created_total           | Number of created shortened URLs |
| url_shortener_redirect_total          | Number of successful redirects   |
| url_shortener_not_found_total         | Number of 404 errors             |
| url_shortener_request_latency_seconds | Request latency histogram        |

---

## 📈 5. Creating Grafana Dashboards

Navigate to:

```
Dashboards → New → New Dashboard
```

Then:

```
Add visualization
```

Type a metric such as:

```
url_shortener_created_total
```

Grafana will generate a graph for the selected metric.

---

## 📌 6. PromQL Queries & Recommended Panels

| Metric                                       | Type      | PromQL Query                                                                                                  | Visualization | Panel Name                      |
| -------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------- |
| url_shortener_created_total                  | Counter   | `rate(url_shortener_created_total[5m])`                                                                       | Time Series   | URLs Created Over Time          |
| url_shortener_redirect_total                 | Counter   | `rate(url_shortener_redirect_total[5m])`                                                                      | Time Series   | Successful Redirects Over Time  |
| url_shortener_not_found_total                | Counter   | `rate(url_shortener_not_found_total[5m])`                                                                     | Time Series   | 404 Not Found Errors Over Time  |
| url_shortener_request_latency_seconds        | Histogram | `rate(url_shortener_request_latency_seconds_sum[5m]) / rate(url_shortener_request_latency_seconds_count[5m])` | Time Series   | Average Request Latency (s)     |
| url_shortener_request_latency_seconds_bucket | Histogram | `histogram_quantile(0.95, rate(url_shortener_request_latency_seconds_bucket[5m]))`                            | Time Series   | 95th Percentile Request Latency |

---

## 🛠 7. Issues Resolved

### ❗ Problem:

Grafana connection error:

```
dial tcp [::1]:9090: connect: connection refused
```

### ✔️ Solution:

Grafana runs inside Docker, so instead of:

```
http://localhost:9090
```

Use:

```
http://prometheus:9090
```

---

## 🎉 Final Result

By the end of Week 3, you successfully built:

* A working URL Shortener application
* Prometheus metrics collection
* Grafana dashboards
* Docker Compose orchestration
* PromQL visualizations



