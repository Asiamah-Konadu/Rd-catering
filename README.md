# RD Catering

## Admin authentication

Admin sign-in uses Auth.js credentials backed by the existing `User.passwordHash` field. Set `NEXTAUTH_SECRET` to a long random value and set `NEXTAUTH_URL` to the deployed application URL. Keep both values server-only and do not commit any `.env` file.

There is no public staff registration. Provision the first administrator from a trusted environment using values supplied at command time:

```sh
ADMIN_NAME="Staff name" ADMIN_EMAIL="staff@example.com" ADMIN_PASSWORD="use-a-long-unique-password" npm run admin:create
```

The command creates or updates only the specified `ADMIN` user and stores a bcrypt hash. Admin pages require an active staff role (`ADMIN`, `MENU_MANAGER`, `ORDER_HANDLER`, or `DELIVERY_AGENT`). Future privileged API routes should call `requireApiRole` from `src/lib/authz.ts`; it returns HTTP 401 for unauthenticated requests and 403 for insufficient roles.

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

Configure `DATABASE_URL` in `.env.local` before using checkout/order pages.

For the first database migration:

```bash
npx prisma migrate dev --name init
```

Never commit real secrets.
