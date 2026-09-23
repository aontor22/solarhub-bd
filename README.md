# SolarHub BD

A complete front-end e-commerce starter for a Bangladesh-focused solar-products store.

## Included

- Responsive home page and solar-themed design
- Categories for panels, inverters, batteries, controllers, lights, accessories and solar kits
- Product search, category filter, price filter and sorting
- Product detail modal
- Cart with quantity controls
- Wishlist and 3-product comparison
- BDT pricing
- Demo checkout with card, mobile banking, bank transfer and cash-on-delivery options
- Installation/service request form
- FAQ section
- Browser-local admin dashboard for demo orders and service requests
- SEO metadata + WebSite structured data
- PWA manifest and service worker
- No external libraries or build tools required

## Run locally

For best results, run a small static server in this folder:

```bash
python -m http.server 8080
```

Then open:

http://localhost:8080

Opening `index.html` directly will also work for most features, though the service worker/PWA install requires a local or hosted web server.

## Before production launch

This project intentionally uses demo product content and browser localStorage. Before accepting real orders:

1. Replace demo products/specifications/prices with verified inventory.
2. Add your real business contact details, delivery, return, warranty, privacy and terms policies.
3. Connect a production database and authenticated admin system.
4. Connect your chosen Bangladesh-compatible payment gateway(s) using server-side credentials.
5. Add shipping-rate logic, inventory synchronization and order notifications.
6. Add real product photography and verified technical datasheets.
7. Add analytics, consent/cookie handling as applicable, and production security hardening.

## Main files

- `index.html` — storefront structure
- `styles.css` — responsive visual design
- `app.js` — catalog, filters, cart, wishlist, compare, checkout and admin demo logic
- `manifest.webmanifest` — installable web app metadata
- `sw.js` — basic offline caching
