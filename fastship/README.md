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
```

## 🚀 تشغيل بأمر واحد

```bash
docker compose up -d --build
```

ثم افتح المتصفح على: **http://localhost**

## 🔐 بيانات الدخول

| اسم المستخدم | كلمة المرور | الدور |
|-------------|------------|-------|
| admin | admin123 | مدير عام |
| ahmed | ahmed123 | موظف استلام |
| mona  | mona123  | محاسب |

## 🛑 إيقاف المشروع

```bash
docker compose down          # إيقاف فقط
docker compose down -v       # إيقاف + حذف البيانات
```

## 📋 أوامر مفيدة

```bash
# لوجز الـ API
docker logs fastship_api -f

# لوجز الـ DB
docker logs fastship_db -f

# دخول قاعدة البيانات
docker exec -it fastship_db psql -U fastship_user -d fastship

# ريستارت سيرفيس واحد
docker compose restart api
```

## 🌐 الـ Endpoints

```
GET  /api/health           فحص الخادم
POST /api/auth/login       تسجيل دخول
GET  /api/auth/me          بيانات المستخدم الحالي
GET  /api/dashboard        إحصائيات
---
/api/shipments             الشحنات (GET/POST/PUT/DELETE)
/api/merchants             التجار
/api/agents                المناديب
/api/returns               الاسترجاع
/api/expenses              المصاريف
/api/transfers             التحويلات
/api/settings/cities       المدن
/api/settings/zones        المناطق
/api/settings/branches     الفروع
/api/settings/roles        الأدوار
/api/settings/users        المستخدمين
/api/settings/reasons      أسباب الإلغاء
```

---
Powered by **Omar Alaasar**
