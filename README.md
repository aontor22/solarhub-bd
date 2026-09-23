# SolarHub BD Pro

A production-style full-stack starter for a Bangladesh-focused solar e-commerce store.

## Included

- Next.js App Router
- PostgreSQL + Prisma
- Customer registration/login
- bcrypt password hashing
- Signed HTTP-only session cookies
- Persistent products, users, orders, stock and service requests
- BDT storefront
- Search/category/sort catalog
- Local cart with secure server-side price/stock re-validation
- Transactional stock decrement
- Customer order-history page
- Admin-only operations dashboard
- Service/installation request workflow
- Responsive design and SEO metadata
- Vercel-ready project structure
- Cash-on-delivery flow
- Safe placeholder for a verified online payment provider

## Important

The seed product catalog contains sample data. Replace prices, brands, specifications and warranty terms with your verified business data before launch.

The project intentionally does **not** fake a live online payment integration. After you obtain credentials from your chosen approved payment provider, connect its server-side API and callback/webhook flow.

## Local setup

1. Install Node.js 20+ and create a PostgreSQL database.
2. Copy `.env.example` to `.env`.
3. Fill in `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
4. Run:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

5. Open `http://localhost:3000`.

## Vercel

1. Push the project to GitHub.
2. Import the repo into Vercel as a Next.js project.
3. Add every required environment variable from `.env.example`.
4. Use a production PostgreSQL connection string for `DATABASE_URL`.
5. From your local machine, with the production `DATABASE_URL` loaded, run:

```bash
npm run db:push
npm run db:seed
```

6. Deploy. The normal build command is:

```bash
npm run build
```

## Environment variables

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`
- `PAYMENT_PROVIDER`
- payment-provider credentials when you add a real provider

## Before accepting real orders

Add real product images and catalog data, real business contact information, tested delivery/courier rules, reviewed privacy/terms/returns/warranty policies, an approved payment integration, password reset/email verification, rate limiting/bot protection, audit logging, analytics, notification delivery, backups and monitoring.
