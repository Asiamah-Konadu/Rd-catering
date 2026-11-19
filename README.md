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

Configure `DATABASE_URL` and `WHATSAPP_ORDER_NUMBER` in `.env.local` before using checkout/order pages. Set `WHATSAPP_ORDER_NUMBER` to `233591754764` (WhatsApp checkout and customer service line is `059 175 4764`). Add the same variable in your Vercel project's Environment Variables for each deployment environment. Orders are saved as pending and sent to WhatsApp for confirmation and payment coordination. Sync the updated payment enum to the database with `npx prisma db push` before deploying.

## Automated WhatsApp + MTN MoMo payments

The Cloud API integration uses the order number in the customer's first WhatsApp message to locate the saved order. It checks that the WhatsApp sender matches the phone number entered at checkout, then requests the saved order total through MTN MoMo Ghana Request to Pay. The payment stays pending until MTN reports a final successful status. The app then marks it paid and sends a WhatsApp confirmation.

Add these server-only values to `.env.local` and the production hosting environment. Do not use `NEXT_PUBLIC_` prefixes for credentials.

```dotenv
WHATSAPP_WEBHOOK_VERIFY_TOKEN="a-long-random-webhook-verification-token"
WHATSAPP_APP_SECRET="Meta app secret"
WHATSAPP_ACCESS_TOKEN="WhatsApp Cloud API access token"
WHATSAPP_PHONE_NUMBER_ID="WhatsApp Business phone number ID"
WHATSAPP_GRAPH_API_VERSION="v27.0"
WHATSAPP_PAYMENT_CONFIRMED_TEMPLATE="payment_confirmed"
WHATSAPP_PAYMENT_FAILED_TEMPLATE="payment_failed"
WHATSAPP_PAYMENT_TEMPLATE_LANGUAGE="en"

MTN_MOMO_API_USER="MTN MoMo API user UUID"
MTN_MOMO_API_KEY="MTN MoMo API key"
MTN_MOMO_SUBSCRIPTION_KEY="MTN MoMo collection subscription key"
MTN_MOMO_TARGET_ENVIRONMENT="mtnghana"
MTN_MOMO_BASE_URL="https://proxy.momoapi.mtn.com"

PAYMENT_RECONCILE_SECRET="a-separate-long-random-secret"
```

Configure the WhatsApp Business Platform webhook callback URL as `https://YOUR_DOMAIN/api/webhooks/whatsapp`, subscribe it to the `messages` webhook field, and use the same `WHATSAPP_WEBHOOK_VERIFY_TOKEN`. Approve utility templates named by `WHATSAPP_PAYMENT_CONFIRMED_TEMPLATE` and `WHATSAPP_PAYMENT_FAILED_TEMPLATE`, each with two body variables (order number, amount), for final payment messages that arrive after the 24-hour customer-service window. Configure the MTN MoMo collection product for Ghana and use the credentials MTN issued for the environment selected in `MTN_MOMO_BASE_URL`.

MTN Request to Pay is asynchronous. Schedule a server-side `POST https://YOUR_DOMAIN/api/payments/mtn/reconcile` once per minute with `Authorization: Bearer PAYMENT_RECONCILE_SECRET`. The endpoint checks up to 50 in-progress payments each run and sends the customer’s final WhatsApp result. Protect the cron secret and ensure the host supports scheduled HTTP requests. The app does not consider HTTP 202 from MTN to mean that payment succeeded.

Before production, confirm the currently supported Ghana API hostname and credentials with MTN. Their developer community has described an API hostname migration while Ghana was still marked in progress, so the configured base URL may depend on the merchant account's migration status. Start with MTN sandbox credentials and a public HTTPS deployment for webhook testing. [MTN Request to Pay](https://momodeveloper.mtn.com/content/html_widgets/v98wn.html) documents the customer approval and asynchronous status flow.

To show Google reviews on the homepage without a review aggregator, configure a Google Cloud project with approved Business Profile API access and OAuth credentials. Set the following server-only values in `.env.local` and in the deployment environment: `GOOGLE_BUSINESS_CLIENT_ID`, `GOOGLE_BUSINESS_CLIENT_SECRET`, `GOOGLE_BUSINESS_REFRESH_TOKEN`, `GOOGLE_BUSINESS_ACCOUNT_ID`, and `GOOGLE_BUSINESS_LOCATION_ID`. Optionally set `GOOGLE_BUSINESS_MIN_REVIEW_RATING` to a value from 1 to 5 (defaults to 4). Keep these values private and never prefix them with `NEXT_PUBLIC_`. The homepage reads reviews directly from the Google Business Profile API and temporarily caches the unmodified API response for ten minutes; it filters reviews in memory and does not save them to the application database. Until the credentials are configured, the homepage shows visible reviews from delivered Rich-Dons orders.

For the first database migration:

```bash
npx prisma migrate dev --name init
```

Never commit real secrets.
