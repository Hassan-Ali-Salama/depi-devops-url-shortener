# 🧱 Week 1 - DevOps DEPI Project  
## 🚀 URL Shortener with Docker

This project is part of the **Digital Egypt Pioneers Initiative (DEPI)** – DevOps Track.  
The goal for Week 1 is to **build and containerize a functional URL Shortener Web Service** using **Node.js, Express, and SQLite**, then run it in a Docker container.

---

## 📋 **Project Description**

The application allows users to:
- Shorten long URLs into simple, shareable short links.  
- Store and manage their created links locally (per user).  
- Redirect short URLs to their original long URLs.  
- View their existing shortened URLs inside a clean frontend interface.  

The entire app is fully containerized using **Docker** and managed with **Docker Compose**.

---

## 🧰 **Tech Stack**

| Component | Technology |
|------------|-------------|
| Backend | Node.js + Express |
| Database | SQLite |
| Frontend | HTML, CSS, Vanilla JS |
| Containerization | Docker, Docker Compose |

---

## 🗂️ **Project Structure**

Week1/

├── app.js

├── Dockerfile

├── docker-compose.yml

├── package.json

├── db/

│ └── data.sqlite

└── public/

├── index.html

└── styles.css


---

## ⚙️ **How to Run Locally (without Docker)**

```bash
# 1️⃣ Install dependencies
npm install

# 2️⃣ Run the server
node app.js

# 3️⃣ Visit in your browser
http://localhost:3000

```
---
## ⚙️ **🐳 How to Run with Docker**
```bash
# 1️⃣ Build the image & Run the container
docker compose up --build -d

# 2️⃣ Check logs (optional)
docker compose logs -f

# 3️⃣ Visit the app
http://localhost:3000
```
---
## 🧩 Docker Configuration Overview

- **Dockerfile:**  
  Builds the Node.js image for the app.

- **docker-compose.yml:**  
  - Defines the `web` service.  
  - Mounts volumes for persistent SQLite data.  
  - Maps port `3000` from container → host.

---

## 🧠 Key Features Implemented

- **Persistent SQLite database** – Data remains saved even after container restarts.  
- **Frontend written in English** – Clean, modern, and responsive card design for better UX.  
- **Unique Owner ID per user** – Stored in browser `localStorage` to keep user-specific links.  
- **Lightweight Docker image** – Built using `node:18-alpine` for fast and efficient deployment.

---
  
## 👨‍💻 Author

**Hassan Ali Salama**  
🎓 Digital Egypt Pioneers Initiative – DevOps Track  
🔗 [GitHub Profile](https://github.com/Hassan-Ali-Salama)
