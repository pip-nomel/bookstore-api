# Bookstore REST API

A production-quality REST API for a bookstore, built with Express.js, TypeScript, Prisma, and SQLite.

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **ORM:** Prisma with SQLite
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Validation:** Zod

## Quick Start

```bash
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

The API runs on `http://localhost:3000`.

## Default Users

| Email | Password | Role |
|---|---|---|
| admin@bookstore.com | admin123 | ADMIN |
| john@example.com | user123 | USER |

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled JS |
| `npm run seed` | Seed database with sample data |
| `npm run prisma:migrate` | Run Prisma migrations |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user `{ email, password, name }`
- `POST /api/auth/login` — Login, returns JWT `{ email, password }`
- `GET /api/auth/me` — Current user profile (🔒 auth required)

### Books
- `GET /api/books` — List books (pagination, search, category filter)
  - Query: `?page=1&limit=10&search=gatsby&categoryId=1`
- `GET /api/books/:id` — Book detail with reviews
- `POST /api/books` — Create book (🔒 admin)
- `PUT /api/books/:id` — Update book (🔒 admin)
- `DELETE /api/books/:id` — Soft-delete book (🔒 admin)

### Categories
- `GET /api/categories` — List all categories
- `POST /api/categories` — Create category (🔒 admin)

### Orders
- `GET /api/orders` — My orders (user) or all orders (admin)
- `GET /api/orders/:id` — Order detail
- `POST /api/orders` — Create order `{ items: [{ bookId, quantity }] }`
- `PATCH /api/orders/:id/status` — Update status (🔒 admin)
- `POST /api/orders/:id/cancel` — Cancel order (own, PENDING only)

### Reviews
- `GET /api/books/:id/reviews` — Reviews for a book
- `POST /api/books/:id/reviews` — Add review (🔒 auth, must have ordered the book)
- `DELETE /api/reviews/:id` — Delete review (own or admin)

## Authentication

Include JWT in the Authorization header:
```
Authorization: Bearer <token>
```

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [{ "field": "email", "message": "Invalid email address" }]
  }
}
```

## Business Rules

- Stock is validated and decremented on order creation
- Cancelling a PENDING order restores stock
- Only PENDING orders can be cancelled
- Users can only review books they've ordered
- One review per user per book
- Book deletion is soft (sets `deletedAt`)
- Admins can see all orders; users see only their own

## Environment Variables

| Variable | Default |
|---|---|
| `DATABASE_URL` | `file:./dev.db` |
| `JWT_SECRET` | (set in .env) |
| `PORT` | `3000` |
