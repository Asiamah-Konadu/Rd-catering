# RD Catering

## Admin authentication

Admin sign-in uses Auth.js credentials backed by the existing `User.passwordHash` field. Set `NEXTAUTH_SECRET` to a long random value and set `NEXTAUTH_URL` to the deployed application URL. Keep both values server-only and do not commit any `.env` file.

There is no public staff registration. Provision the first administrator from a trusted environment using values supplied at command time:

```sh
ADMIN_NAME="Staff name" ADMIN_EMAIL="staff@example.com" ADMIN_PASSWORD="use-a-long-unique-password" npm run admin:create
```

The command creates or updates only the specified `ADMIN` user and stores a bcrypt hash. Admin pages require an active staff role (`ADMIN`, `MENU_MANAGER`, `ORDER_HANDLER`, or `DELIVERY_AGENT`).

To provision a specific staff role (such as `MENU_MANAGER`, `ORDER_HANDLER`, or `DELIVERY_AGENT`):

```sh
STAFF_NAME="Menu Manager" STAFF_EMAIL="manager@example.com" STAFF_PASSWORD="use-a-long-unique-password" STAFF_ROLE="MENU_MANAGER" npm run staff:create
```

Production-oriented starter application for RD Catering.

## Included
- Next.js App Router frontend
- Responsive customer homepage and menu
- Local cart
- Checkout flow
- PostgreSQL/Neon + Prisma schema
- Order creation API
- Order confirmation page
- Basic operations/admin dashboard
- Neon GitHub workflow placeholder
- Secure `.env` pattern

## Run locally

```bash
npm install
npx prisma generate
npm run dev
```

Configure `DATABASE_URL`, `APP_URL`, and the Hubtel values below before using checkout. Customers place orders and pay on the website; WhatsApp is not part of the payment flow. Apply database changes with `npx prisma migrate deploy` before deploying.

## Hubtel Online Checkout

Checkout saves the order first, then opens an RD Catering payment page that creates and embeds Hubtel's secure checkout. Customers can pay with mobile money, card, or Hubtel Wallet. Email is optional. The server supplies the saved order amount and reference; it never accepts payment totals from the browser.

Add these server-only values to `.env.local` and Cloudflare Worker secrets. Never use `NEXT_PUBLIC_` prefixes for credentials.

```dotenv
APP_URL="https://your-domain.example"
HUBTEL_API_ID="Hubtel API ID"
HUBTEL_API_KEY="Hubtel API key"
HUBTEL_COLLECTION_ACCOUNT="Hubtel collection account number"
HUBTEL_ENV="sandbox"
PAYMENT_RECONCILE_SECRET="a-separate-long-random-secret"
```

The checkout request sends Hubtel the callback URL `https://YOUR_DOMAIN/api/webhooks/hubtel`. Set `HUBTEL_ENV=production` and replace sandbox credentials before accepting live payments.

Hubtel does not document a production callback signature, so the callback handler checks the documented Hubtel source IP and matches the callback reference and amount to the stored order. If a callback is missing after five minutes, Hubtel requires a status check. Its status API requires an allowlisted server IP, which Cloudflare Workers Free does not provide; confirm with Hubtel how to reconcile missing callbacks from Cloudflare before accepting live payments.

## Cloudflare deployment

The app uses OpenNext to run Next.js on Cloudflare Workers. Prisma is configured without its Rust engine and uses Neon Serverless, which can connect from Workers. Use the pooled Neon connection string for `DATABASE_URL`. Store `DATABASE_URL`, `NEXTAUTH_SECRET`, `HUBTEL_API_ID`, `HUBTEL_API_KEY`, and `PAYMENT_RECONCILE_SECRET` as Worker secrets. Set `APP_URL`, `NEXTAUTH_URL`, `HUBTEL_ENV`, and `HUBTEL_COLLECTION_ACCOUNT` as Worker variables.

Create the OpenNext cache bucket once with `npx wrangler r2 bucket create rd-catering-incremental-cache`. Then use `npm run cf:build` to build, `npm run cf:preview` to preview locally in the Workers runtime, and `npm run cf:deploy` to deploy. Apply the migration to the production database before accepting live orders. Configure the `rd-catering` Worker with the production domain in Cloudflare and set `APP_URL` to that same HTTPS domain.

To show Google reviews on the homepage without a review aggregator, configure a Google Cloud project with approved Business Profile API access and OAuth credentials. Set the following server-only values in `.env.local` and in the deployment environment: `GOOGLE_BUSINESS_CLIENT_ID`, `GOOGLE_BUSINESS_CLIENT_SECRET`, `GOOGLE_BUSINESS_REFRESH_TOKEN`, `GOOGLE_BUSINESS_ACCOUNT_ID`, and `GOOGLE_BUSINESS_LOCATION_ID`. Optionally set `GOOGLE_BUSINESS_MIN_REVIEW_RATING` to a value from 1 to 5 (defaults to 4). Keep these values private and never prefix them with `NEXT_PUBLIC_`. The homepage reads reviews directly from the Google Business Profile API and temporarily caches the unmodified API response for ten minutes; it filters reviews in memory and does not save them to the application database. Until the credentials are configured, the homepage shows visible reviews from delivered Rich-Dons orders.

For the first database migration:

```bash
npx prisma migrate dev --name init
```

Never commit real secrets.
