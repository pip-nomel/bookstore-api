# Bookstore - Full-Stack Application

Express + Prisma + SQLite backend with React + TypeScript frontend.

## Setup

```bash
# Install root dependencies
npm install

# Install server & client dependencies
npm run install:all

# Seed the database
npm run seed

# Run both server and client
npm run dev
```

- **Server:** http://localhost:3456 (API)
- **Client:** http://localhost:5173 (Frontend, proxies /api to server)

## Default Users

| Email | Password | Role |
|-------|----------|------|
| admin@bookstore.com | admin123 | ADMIN |
| john@example.com | user123 | USER |

## Scripts

- `npm run dev` — runs server + client concurrently
- `npm run dev:server` — backend only
- `npm run dev:client` — frontend only
- `npm run seed` — seed database
- `npm run build` — build frontend

## Tech Stack

**Backend:** Express, Prisma, SQLite, JWT, Zod
**Frontend:** Vite, React 18, TypeScript, Tailwind CSS, React Query, React Router v6
