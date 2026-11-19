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

Configure `DATABASE_URL` and `WHATSAPP_ORDER_NUMBER` in `.env.local` before using checkout/order pages. Set `WHATSAPP_ORDER_NUMBER` to `233591754764` (WhatsApp checkout and customer service line is `059 175 4764`). Add the same variable in your Vercel project's Environment Variables for each deployment environment. Checkout saves the order and opens a prefilled WhatsApp message with the order reference; payment begins only after the customer sends that message. Sync the updated payment enum to the database with `npx prisma db push` before deploying.

## Automated WhatsApp + Paystack Mobile Money payments

The Cloud API webhook uses the order number in the customer's first WhatsApp message to locate the saved order. It checks that the WhatsApp sender matches the phone number entered at checkout, then starts a Paystack Ghana Mobile Money charge for the saved order total and MTN provider. The customer approves the prompt on their phone. The payment is marked paid only after the signed Paystack webhook is received and the transaction is verified against its reference, GHS amount, and order metadata.

Paystack requires a customer email for the Charge API, so checkout requires one and stores it on the order. Add these server-only values to `.env.local` and the hosting environment. Never use `NEXT_PUBLIC_` prefixes for credentials.

```dotenv
WHATSAPP_WEBHOOK_VERIFY_TOKEN="a-long-random-webhook-verification-token"
WHATSAPP_APP_SECRET="Meta app secret"
WHATSAPP_ACCESS_TOKEN="WhatsApp Cloud API access token"
WHATSAPP_PHONE_NUMBER_ID="WhatsApp Business phone number ID"
WHATSAPP_GRAPH_API_VERSION="v27.0"
WHATSAPP_PAYMENT_CONFIRMED_TEMPLATE="payment_confirmed"
WHATSAPP_PAYMENT_FAILED_TEMPLATE="payment_failed"
WHATSAPP_PAYMENT_TEMPLATE_LANGUAGE="en"

PAYSTACK_SECRET_KEY="Paystack secret key"
PAYSTACK_MOBILE_MONEY_PROVIDER="mtn"
PAYMENT_RECONCILE_SECRET="a-separate-long-random-secret"
```

Configure the WhatsApp Business Platform webhook at `https://YOUR_DOMAIN/api/webhooks/whatsapp`, subscribe it to the `messages` field, and enter the same `WHATSAPP_WEBHOOK_VERIFY_TOKEN`. Configure Paystack's webhook URL as `https://YOUR_DOMAIN/api/webhooks/paystack` in the Paystack dashboard. Keep the WhatsApp confirmation and failure templates approved for messages outside the customer-service window.

Mobile Money charges are asynchronous. Schedule `POST https://YOUR_DOMAIN/api/payments/paystack/reconcile` once per minute with `Authorization: Bearer PAYMENT_RECONCILE_SECRET`. This checks up to 50 in-progress Paystack transactions and verifies their status before changing an order's payment state. Paystack Mobile Money authorization requests expire after 180 seconds; webhook processing is primary and reconciliation covers missing webhook events.

To show Google reviews on the homepage without a review aggregator, configure a Google Cloud project with approved Business Profile API access and OAuth credentials. Set the following server-only values in `.env.local` and in the deployment environment: `GOOGLE_BUSINESS_CLIENT_ID`, `GOOGLE_BUSINESS_CLIENT_SECRET`, `GOOGLE_BUSINESS_REFRESH_TOKEN`, `GOOGLE_BUSINESS_ACCOUNT_ID`, and `GOOGLE_BUSINESS_LOCATION_ID`. Optionally set `GOOGLE_BUSINESS_MIN_REVIEW_RATING` to a value from 1 to 5 (defaults to 4). Keep these values private and never prefix them with `NEXT_PUBLIC_`. The homepage reads reviews directly from the Google Business Profile API and temporarily caches the unmodified API response for ten minutes; it filters reviews in memory and does not save them to the application database. Until the credentials are configured, the homepage shows visible reviews from delivered Rich-Dons orders.

For the first database migration:

```bash
npx prisma migrate dev --name init
```

Never commit real secrets.
