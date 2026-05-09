# 📦 FastShip Express — Full Stack

Node.js + PostgreSQL + Nginx + Docker Compose

```
fastship/
├── docker-compose.yml       ← كل الـ services
├── docker/
│   └── nginx.conf           ← Reverse proxy + static files
├── frontend/                ← HTML/CSS/JS (بدون تعديل)
│   ├── login.html
│   ├── index.html
│   ├── style.css
│   ├── api.js               ← API client
│   └── app.js
└── backend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── server.js
        ├── db/
        │   ├── pool.js
        │   ├── schema.sql
        │   └── seed.sql
        ├── middleware/
        │   └── auth.js
        └── routes/
            ├── auth.js
            ├── shipments.js
            ├── merchants.js
            ├── agents.js
            ├── returns_expenses.js
            ├── dashboard_transfers.js
            └── settings.js
``

Powered by **Omar Alaasar**
