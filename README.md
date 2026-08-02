# White-label online shop

This is a reusable Next.js storefront for shops and departmental stores that need an online presence. It includes product discovery, product pages, a persistent cart, customer accounts, seller onboarding and a pay-on-delivery checkout prototype.

## Create a shop for a new client

1. Edit `src/config/store.ts` with the shop name, initials, tagline, contact details, delivery rules, payment options and colours.
2. Edit `src/lib/catalog.ts` to replace the sample products. Every product needs a unique numeric `id` and URL-friendly `slug`.
3. Replace or add images in `public/`, or use approved remote image hosts in `next.config.ts`.
4. Run the quality checks below.
5. Deploy the client copy with its own domain and environment variables.

The `storageNamespace` setting must be unique for each shop. It prevents carts and prototype orders from different client sites sharing browser-storage keys.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase setup

1. Create a separate Supabase project for the client.
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local`.
4. Add the project URL and publishable key.

Without these variables, the storefront and pay-on-delivery checkout work in local prototype mode. Authentication displays a setup notice.

## Routes

- `/` — storefront, search and categories
- `/products/[slug]` — product details
- `/cart` — persistent shopping cart
- `/checkout` — delivery details and order confirmation
- `/account` — Supabase login and registration
- `/sell` — optional seller application
- `/owner` — prototype product and order dashboard

## Demonstration owner dashboard

The temporary owner PIN is configured in `src/config/store.ts`. The default is `1234`. Products and orders are stored only in the current browser, making this suitable for demonstrations but not production. Replace the PIN and browser storage with Supabase authentication and database tables before giving the dashboard to a real client.

After checkout, customers can send a formatted order summary directly to the WhatsApp number configured for the shop.

## Quality checks

```bash
npm run lint
npm run build
```

## Production work still required

Move the catalogue and order creation fully into Supabase, upload product images to managed storage, verify inventory server-side, add server-verified Paystack payments, create the shop-owner order/product dashboard, add tests and configure monitoring.
