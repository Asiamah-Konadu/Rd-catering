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

Configure `DATABASE_URL` and `WHATSAPP_ORDER_NUMBER` in `.env.local` before using checkout/order pages. Set `WHATSAPP_ORDER_NUMBER` to `233248179348` (WhatsApp checkout and customer service line is `0248179348`). Add the same variable in your Vercel project's Environment Variables for each deployment environment. Orders are saved as pending and sent to WhatsApp for confirmation and payment coordination. Sync the updated payment enum to the database with `npx prisma db push` before deploying.

To show Google reviews on the homepage without a review aggregator, configure a Google Cloud project with approved Business Profile API access and OAuth credentials. Set the following server-only values in `.env.local` and in the deployment environment: `GOOGLE_BUSINESS_CLIENT_ID`, `GOOGLE_BUSINESS_CLIENT_SECRET`, `GOOGLE_BUSINESS_REFRESH_TOKEN`, `GOOGLE_BUSINESS_ACCOUNT_ID`, and `GOOGLE_BUSINESS_LOCATION_ID`. Optionally set `GOOGLE_BUSINESS_MIN_REVIEW_RATING` to a value from 1 to 5 (defaults to 4). Keep these values private and never prefix them with `NEXT_PUBLIC_`. The homepage reads reviews directly from the Google Business Profile API and temporarily caches the unmodified API response for ten minutes; it filters reviews in memory and does not save them to the application database. Until the credentials are configured, the homepage shows visible reviews from delivered Rich-Dons orders.

For the first database migration:

```bash
npx prisma migrate dev --name init
```

Never commit real secrets.
