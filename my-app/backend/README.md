Express backend for authentication (dev)

Quick start

1. Copy `.env.example` to `.env` and set `JWT_SECRET` (and optionally `PORT`).

2. Install deps and run:

```powershell
cd backend
npm install
npm run dev
```

Server endpoints:

- POST `/auth/signup` { name, email, password, role } -> 201 { token, user }
- POST `/auth/signin` { email, password } -> 200 { token, user }
- GET `/auth/me` with header `Authorization: Bearer <token>` -> 200 { user }

Storage:

- Uses `backend/data/users.json` (file-based) for local development only.

Security notes:

- Do not use file-based storage in production.
- Use a strong `JWT_SECRET` and prefer httpOnly cookies in real apps.
