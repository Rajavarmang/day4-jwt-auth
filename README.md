# 🏢 OrgAuth — Full Stack JWT Authentication App
**Nunnari Academy | Full Stack Development with AI Bootcamp | Day 4 Submission**

---

## 📋 Project Overview

A complete full-stack web application implementing **Organization Authentication** using **JWT (JSON Web Tokens)**. Built as part of Day 4 assignment covering frontend-backend integration, secure authentication, and protected routes.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Database** | In-memory (simulates real DB) |

---

## 📁 Folder Structure

```
fullstack-jwt/
├── backend/
│   ├── server.js          # Main Express server with JWT
│   └── package.json       # Dependencies
├── frontend/
│   ├── index.html         # Login & Register page
│   └── dashboard.html     # Protected Dashboard page
└── README.md
```

---

## ✅ Day 4 Tasks Completed

### Task 1 — Frontend–Backend Integration (Update API)
- **PUT** `/api/organizations/:id` — Updates org data from UI → Backend → In-memory DB → Response → UI
- Form pre-fills from API, user edits, submits, response reflected live in UI

### Task 2 — Organization Login with JWT
- **POST** `/api/auth/register` — Register new organization  
- **POST** `/api/auth/login` — Login and receive **JWT token**
- Token stored in `localStorage` after successful login
- **Bearer Token** used in `Authorization` header for all protected routes

### Task 3 — Protected Routes
| Endpoint | Method | Protected |
|----------|--------|-----------|
| `/api/profile` | GET | ✅ JWT Required |
| `/api/dashboard` | GET | ✅ JWT Required |
| `/api/employees` | GET | ✅ JWT Required |
| `/api/employees` | POST | ✅ JWT Required |
| `/api/organizations/:id` | PUT | ✅ JWT Required |
| `/api/organizations/:id` | DELETE | ✅ JWT Required |
| `/api/auth/verify` | GET | ✅ JWT Required |
| `/api/auth/login` | POST | 🌐 Public |
| `/api/auth/register` | POST | 🌐 Public |
| `/api/organizations` | GET | 🌐 Public |

### Task 4 — End-to-End Flow Validation
```
Frontend (UI) → HTTP Request + Bearer Token
    → Express Middleware (JWT Verify)
        → Controller Logic
            → In-Memory DB
                → JSON Response
                    → UI Updated ✅
```

### Task 5 — GitHub Submission
- Clean folder structure ✅
- README with setup instructions ✅

---

## 🏃 How to Run

### 1. Start the Backend
```bash
cd backend
npm install
node server.js
# Server runs on http://localhost:5000
```

### 2. Open the Frontend
```bash
# Option A: Open directly in browser
open frontend/index.html

# Option B: Use Live Server (VS Code extension)
# Right-click index.html → Open with Live Server
```

### 3. Test Credentials
```
Email:    admin@nunnari.com
Password: admin123

Email:    info@techcorp.com
Password: tech456
```

---

## 🔐 JWT Authentication Flow

```
1. User submits login form
2. Backend verifies credentials (bcrypt)
3. Server generates JWT token (expires: 24h)
4. Token stored in localStorage
5. Frontend attaches token to every request:
   Authorization: Bearer <token>
6. Middleware verifies token on protected routes
7. Decoded user info available in req.user
```

---

## 📡 API Reference

### Auth Endpoints

**POST** `/api/auth/register`
```json
{
  "name": "My Company",
  "email": "me@company.com",
  "password": "secret123",
  "industry": "Tech",
  "location": "Chennai"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "admin@nunnari.com",
  "password": "admin123"
}
```
Response includes `token` field.

### Protected Endpoints (add `Authorization: Bearer <token>` header)

**GET** `/api/profile` — Get logged-in org profile  
**GET** `/api/dashboard` — Get stats + employees  
**GET** `/api/employees` — List all employees  
**POST** `/api/employees` — Add employee  
**PUT** `/api/organizations/:id` — Update organization  

---

## 👨‍💻 Author

Submitted for Nunnari Academy — Full Stack Development with AI Bootcamp  
Day 4: Frontend-Backend Integration & JWT Authentication
