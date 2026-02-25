# Book Dashboard

A small library dashboard built with Next.js App Router, Prisma, and PostgreSQL. It provides a public catalog view and an authenticated dashboard for managing books and categories.

## Features

- Public catalog with book and category lists, stats, and pagination.
- Authenticated dashboard for CRUD operations on books and categories.
- NextAuth credentials login (demo-friendly).
- Prisma + PostgreSQL data layer with seed data.

## Tech Stack

- Next.js (App Router)
- React 19
- Prisma ORM with PostgreSQL
- NextAuth (credentials)
- Tailwind CSS

## Routes

- `/` landing page with login entry.
- `/catalog` public catalog (read-only).
- `/dashboard` authenticated dashboard (create, update, delete).

## API Endpoints

- `GET /api/books` (public, paginated)
- `GET /api/categories` (public, paginated)
- `GET /api/admin/books` (auth required)
- `POST /api/admin/books` (auth required)
- `PUT /api/admin/books` (auth required)
- `DELETE /api/admin/books` (auth required)
- `GET /api/admin/categories` (auth required)
- `POST /api/admin/categories` (auth required)
- `PUT /api/admin/categories` (auth required)
- `DELETE /api/admin/categories` (auth required)

## Environment Variables

Create a `.env` file in the project root with:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NEXTAUTH_SECRET="replace-with-a-long-random-string"
```

## Local Development

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open http://localhost:3000.

## Demo Credentials

Use these credentials to log in:

- Email: admin@local.com
- Password: password123

## Scripts

- `npm run dev` Start the dev server
- `npm run build` Build for production
- `npm run start` Start the production server
- `npm run lint` Run ESLint

## Notes

- The credentials provider is currently hardcoded for demo use.
- Seed data creates sample categories and books.
