# SolarHub BD Pro — Production-Ready Store Foundation

A full-stack Next.js + PostgreSQL solar e-commerce application designed for deployment on Vercel.

## What is included

### Customer storefront
- Responsive home, catalog, product detail, FAQ, policy and service pages
- Search, category filtering and sorting
- Product images by CDN/HTTPS URL with fallback visuals
- Local cart with server-side price and stock verification
- Customer registration/login with bcrypt password hashing
- Signed HTTP-only session cookies
- Wishlist for signed-in customers
- Account page with itemized order history and payment/order status
- Cash on delivery
- Optional manual bKash, Nagad and bank-transfer checkout
- Manual payment sender + transaction/reference capture
- Server-side coupon validation
- Installation/service request form

### Operations/admin
- Admin-only dashboard
- Create and update products
- Change price, stock, low-stock threshold, image, active and featured status
- Manage order lifecycle
- Verify/update payment status
- Cancellation safely restores inventory once and makes cancellation terminal
- Manage installation/service request status
- Create, enable and disable coupon codes
- Audit logs for admin changes

### Production safeguards
- PostgreSQL + Prisma persistence
- Serializable checkout transaction and conditional stock decrement
- Database-backed rate limiting for login, registration, checkout and service forms
- Same-origin validation for state-changing browser requests
- Strong production `AUTH_SECRET` requirement
- Security headers and disabled `X-Powered-By`
- Input trimming, length limits and phone/email validation
- Health endpoint at `/api/health`
- `robots.txt`, sitemap, custom 404 and runtime error UI
- Responsive mobile navigation and admin tables

## Local setup

1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env`.
3. Set at minimum:
   - `DATABASE_URL`
   - `AUTH_SECRET` (32+ random characters)
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
4. Install and initialize:

```bash
npm install
npm run db:validate
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Manual payment setup

Configure only the methods you actually accept. Empty values are hidden automatically from checkout.

```env
MANUAL_PAYMENT_BKASH_NUMBER="01XXXXXXXXX"
MANUAL_PAYMENT_NAGAD_NUMBER="01XXXXXXXXX"
MANUAL_PAYMENT_BANK_INFO="Bank / account / routing instructions"
```

A customer-submitted transaction ID is stored with `paymentStatus=PENDING`. An admin must verify the transaction externally and change the payment status to `PAID`.

## Shipping setup

```env
SHIPPING_FEE="150"
FREE_SHIPPING_MIN="50000"
```

Values are in BDT.

## Vercel deployment

1. Push this folder to a Git repository.
2. Import it into Vercel as a Next.js project.
3. Create a production PostgreSQL database (for example, a provider with a Vercel integration).
4. Add all required environment variables in Vercel Project Settings.
5. With the production `DATABASE_URL` available locally or in a controlled deployment environment, run:

```bash
npm run db:push
npm run db:seed
```

6. Deploy with the normal build command:

```bash
npm run build
```

### Important database note

`prisma db push` is convenient for this supplied project because it does not ship with an environment-specific migration history. Once the schema is under active production development, create and commit Prisma migrations for future schema changes and use a migration deployment workflow rather than repeatedly pushing schema changes directly.

## Store data before public launch

The included catalog is sample seed data so the application is immediately testable. Use the admin dashboard or your import process to replace it with your real products, verified prices, stock, product images, specifications, supplier warranty terms and brands.

Also configure your real support phone/email/address and have the public policies reviewed against your actual commercial practices.

## Recommended external production services

The core app works without paid add-ons, but a public store should normally connect:
- a transactional email provider for order, verification and password-reset emails;
- a CDN/object-storage service for managed product image uploads instead of manually pasting image URLs;
- centralized observability/error monitoring;
- automated database backups;
- an approved payment gateway if you want automated online payment confirmation instead of manual verification.

Do not place secret payment, database or admin credentials in `NEXT_PUBLIC_*` variables or commit `.env` files.
