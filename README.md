# Twenty Five Food Ordering

A full-stack food ordering system with a customer storefront, admin dashboard, realtime order/product updates, COD confirmation, simulated GPay QR checkout, product CRUD, and sales analytics.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Socket.io client, Recharts, Lucide icons
- Backend: Node.js, Express, Socket.io, JWT auth
- Database: MongoDB when `MONGODB_URI` is configured, JSON file datastore for local demos

## Project Structure

```text
frontend/   React customer website and admin dashboard
backend/    Express API, realtime server, auth, persistence
```

## Setup

```powershell
npm.cmd run install:all
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
npm.cmd run dev
```

Customer website: `http://localhost:5173`

Admin dashboard: `http://localhost:5173/admin`

Default demo admin:

- Email: `admin@twentyfive.local`
- Password: `admin12345`

## MongoDB

The backend runs without MongoDB using `backend/data/db.json`. To use MongoDB, set:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/twentyfive
```

## Production Notes

- Change `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` before deployment.
- Set `CLIENT_ORIGIN` to the deployed frontend URL.
- Build frontend with `npm.cmd run build --prefix frontend`.
- Start backend with `npm.cmd start --prefix backend`.
