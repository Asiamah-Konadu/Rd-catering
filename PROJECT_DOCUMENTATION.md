# RD Catering — Project Documentation

## 1. Project at a glance

RD Catering is a web application for Rich-Dons Catering. Customers use it to discover Ghanaian dishes, customize an order, choose a delivery location and timing, and send the order to the restaurant through WhatsApp. The application saves the order first, so the customer and staff have a reference number and the operations team can track its status. Staff use a protected admin area to manage the menu, orders, delivery work, company lunch programs, promotions, and storefront settings.

The site is designed primarily for customers ordering in Accra. Prices and delivery workflows are expressed for the Ghanaian market. It supports both individual orders and scheduled corporate lunch orders.

### What customers can do

- Explore the homepage, menu categories, featured dishes, weekly menu, and event catering information.
- Add menu items and extras to a browser-based shopping bag.
- Enter contact and delivery details, select a map location, and choose ASAP or scheduled delivery when available.
- Apply an eligible promotion and submit an order.
- Open a prefilled WhatsApp message to confirm the saved order and coordinate payment.
- View an order status page and submit a review after delivery.
- Browse registered corporate lunch portals and place a company order.

### What staff can do

- Sign in to the admin workspace using staff credentials.
- Maintain menu items, categories, extras, weekly menus, and homepage promotions.
- Review orders, update their progress, and manage delivery assignments.
- Manage staff, corporate accounts, storefront settings, and showcase content.
- View operational and business analytics.

## 2. Typical customer journey

1. **Discover:** The homepage introduces the business, current dishes, promotional content, opening information, and customer reviews. The menu presents available dishes by category.
2. **Choose:** A customer opens a dish or category, adds items to the cart, and may choose extras. Cart state is handled in the browser by the cart provider.
3. **Check out:** The customer provides their name, phone number, optional email, address and delivery coordinates, notes, and timing. The checkout page uses kitchen hours to guide ASAP versus scheduled delivery.
4. **Create the order:** The server validates the request, looks up the current menu and extra prices in the database, computes totals, applies applicable corporate or promo discounts, and saves the order, items, pending payment, and pending delivery.
5. **Confirm in WhatsApp:** The API responds with an order number and a WhatsApp URL containing a summary. The customer follows that link to confirm directly with the catering team. Payment is coordinated outside the application; the initial payment record is pending.
6. **Track and review:** The customer can visit `/order/[orderNumber]` to see the order tracker. After delivery, the review endpoint allows feedback tied to that order.

Corporate customers use `/corporate` to find a company portal and `/corporate/[slug]` to order under its saved delivery address and lunch terms. Corporate orders are scheduled and can receive company-configured free delivery and percentage discounts.

## 3. Main pages and capabilities

| Route | Purpose |
| --- | --- |
| `/` | Storefront, featured dishes, weekly menu, promotion, customer reviews |
| `/menu` | Browse available dishes by category |
| `/menu/[slug]` | Dish details |
| `/cart` | Review and edit the local cart |
| `/checkout` | Customer details, location, timing, promo and order submission |
| `/order/[orderNumber]` | Order confirmation and status tracker |
| `/events` | Event catering information and inquiry flow |
| `/corporate` | Corporate lunch directory |
| `/corporate/[slug]` | Company-specific lunch ordering portal |
| `/terms`, `/privacy` | Customer-facing policy pages |
| `/admin/login` | Staff sign-in |
| `/admin` | Operations dashboard |
| `/admin/menu`, `/admin/categories`, `/admin/extras` | Menu catalog management |
| `/admin/weekly-menu`, `/admin/hero-promo`, `/admin/showcase` | Storefront content management |
| `/admin/orders`, `/admin/deliveries` | Order and delivery operations |
| `/admin/companies`, `/admin/staff`, `/admin/settings` | Business, staff, and settings administration |

The application also exposes sitemap, robots, manifest, Open Graph image, and API routes under `/api`.

## 4. Technology and architecture

- **Next.js 15 App Router** provides server-rendered pages, client-side interactive components, route handlers, metadata, and static app endpoints.
- **React 19 and TypeScript** implement the UI and typed server/client logic.
- **Tailwind CSS 4** is the styling foundation, with custom CSS in `src/app/globals.css`.
- **PostgreSQL** stores operational data. The documented deployment target is Neon, though Prisma connects through a standard `DATABASE_URL`.
- **Prisma 6** defines the relational schema, queries, transactions, and generated client.
- **Auth.js (NextAuth v5 beta)** provides credentials sign-in for staff. Passwords are hashed and checked using bcryptjs; signed-in session identity and role are carried in a JWT.
- **WhatsApp deep links** carry the order summary to the restaurant. They are not a payment gateway or an automated WhatsApp messaging integration.
- **Three.js** is used by selected visual showcase components. Lucide React supplies interface icons.

### Request and data flow

```text
Browser pages/components
   ├── Server Components ──> Prisma ──> PostgreSQL
   ├── Client Components ──> /api route handlers
   └── CartProvider (local browser state)

/api/orders POST
   ├── validates customer payload
   ├── reloads item/extra prices and availability from PostgreSQL
   ├── computes fee, discount, and total
   ├── transactionally creates Order + OrderItems + Delivery + Payment
   └── returns order number + WhatsApp confirmation URL

Staff browser ── Auth.js session ── role-checked admin APIs ── Prisma
```

Most pages use the App Router convention: `src/app/<route>/page.tsx`. Interactive client components are marked with `'use client'`. Shared UI lives in `src/components`; reusable domain helpers live in `src/lib`; route handlers live in `src/app/api`.

## 5. Data model

The canonical schema is [`prisma/schema.prisma`](prisma/schema.prisma). Important entities and relationships are:

- **User:** Customer or staff identity, optional phone and password hash, active flag, role, orders and reviews. Staff roles are `ADMIN`, `MENU_MANAGER`, `ORDER_HANDLER`, and `DELIVERY_AGENT`; `CUSTOMER` is the default role.
- **Category → MenuItem:** Categories group dishes. Items include price, availability, featured state, image and description. Public menu queries only expose active categories and available items.
- **WeeklyMenu → WeeklyMenuItem → MenuItem:** A dated, publishable ordered selection of dishes.
- **Combo → ComboItem:** A named priced bundle composed of menu items. (The schema supports combos; current checkout logic should be checked before assuming every combo path is enabled.)
- **Extra:** Optional priced additions, optionally associated with a menu item.
- **Order → OrderItem → OrderItemExtra:** Order header plus a durable snapshot of item names, quantities, unit prices and totals, and selected extras. A snapshot preserves the order as placed if the menu changes later.
- **Payment:** One payment record per order, with method, amount, status and optional transaction ID. Checkout creates it as `WHATSAPP` / `PENDING`.
- **Delivery:** One delivery record per order, including address, optional coordinates, delivery status, and optional assigned staff agent.
- **Company:** Corporate portal and its address, order cutoff, batch time, delivery and discount rules.
- **WaitlistEntry:** Contact and unique promo code, including redemption state.
- **Review:** One review per order, with rating, comment, visibility and optional user.
- **HeroPromo, SiteSettings, ShowcaseConfig:** Editable storefront configuration. Site settings use the singleton ID `singleton`.
- **CmsPage:** Schema support for authored/published content pages.

Order status progresses through `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `OUT_FOR_DELIVERY`, and `DELIVERED`, with `CANCELLED` as an alternate terminal state. Delivery and payment have their own separate enums and lifecycles.

## 6. API overview

Routes are implemented as Next.js Route Handlers. This is a functional map, not a substitute for inspecting individual handler validation and role rules.

| Endpoint | Typical role | Purpose |
| --- | --- | --- |
| `POST /api/orders` | Public | Validate and create an order, return WhatsApp URL |
| `GET /api/orders/[orderNumber]` | Public order reference | Retrieve order tracking information |
| `POST /api/orders/[orderNumber]/review` | Public order reference | Submit order review |
| `GET /api/extras` | Public | List available extras |
| `GET /api/companies`, `GET /api/companies/[slug]` | Public | List and retrieve active corporate portals |
| `POST /api/waitlist` | Public | Join waitlist and receive promo information |
| `POST /api/promo/validate` | Public | Validate promo code for checkout |
| `GET /api/settings` | Public | Read public storefront settings |
| `/api/admin/orders` and `/api/admin/orders/[id]` | Staff | List and update order operations |
| `/api/admin/menu`, `/categories`, `/extras` | Staff | Manage catalog data |
| `/api/admin/deliveries`, `/staff`, `/companies` | Staff | Manage delivery, staff, and corporate records |
| `/api/admin/weekly-menu`, `/hero-promo`, `/showcase`, `/settings` | Staff | Manage storefront configuration |
| `/api/admin/analytics` | Staff | Retrieve analytics data |
| `/api/auth/[...nextauth]` | Auth.js | Credentials sign-in and session endpoints |
| `/api/keep-warm` | Operational | Lightweight service/database warm-up endpoint |

Admin APIs call shared authorization helpers in `src/lib/authz.ts`. Individual endpoints may restrict operations to more specific roles. Verify the relevant route before granting a staff member a role.

## 7. Staff access and security model

There is no public staff registration flow. Trusted operators create staff users with command-line scripts. `src/auth.ts` normalizes email, rejects inactive users and non-staff roles, verifies bcrypt password hashes, and places the authenticated staff ID and role in the session token. `src/lib/authz.ts` provides checks for any authenticated staff user, a specific role, or a set of roles.

Practical security requirements:

- Set a strong unique `AUTH_SECRET` or `NEXTAUTH_SECRET` in each environment. Keep secrets server-only.
- Set `NEXTAUTH_URL` to the deployed site URL where required by the deployment setup.
- Use strong unique staff passwords, and deactivate staff accounts when access should end.
- Keep `.env.local` and all production secrets out of version control. Do not expose secret values with `NEXT_PUBLIC_` prefixes.
- Restrict database access and use HTTPS in production.
- Public order lookup uses the order number as its reference; treat order links as private and avoid publishing them.

## 8. Local setup and operation

### Requirements

- Node.js compatible with the installed Next.js 15 release.
- npm (a lockfile is included).
- A PostgreSQL database accessible through `DATABASE_URL` for database-backed functionality.

### Start the app

```bash
npm install
npx prisma generate
npm run dev
```

The development server normally runs at `http://localhost:3000`.

### Environment configuration

At minimum, configure these in `.env.local` for normal ordering:

```dotenv
DATABASE_URL="postgresql://..."
WHATSAPP_ORDER_NUMBER="233248179348"
AUTH_SECRET="a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

`WHATSAPP_ORDER_NUMBER` should contain the international number digits used by the WhatsApp deep link. Production values belong in the hosting provider's server-side environment settings. The database-backed storefront can fall back to defaults or empty menu data when the database is unavailable, but checkout and staff functions require a working database.

### Database workflow

For a new database, create and apply a migration:

```bash
npx prisma migrate dev --name init
```

For subsequent schema changes in development, use `npm run db:migrate` (or the Prisma CLI with an explicit migration name). In production, use `npm run db:deploy`. `npx prisma db push` is available for synchronizing a schema in setups that intentionally do not use migrations; the project README calls out its use for payment enum synchronization. Use the migration workflow consistently for production history.

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Generate Prisma client and build Next.js app |
| `npm run start` | Serve a production build |
| `npm run lint` | Run configured lint command |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run development migration workflow |
| `npm run db:deploy` | Apply existing migrations in deployment |
| `npm run db:studio` | Open Prisma Studio |
| `npm run admin:create` | Create/update the specified ADMIN account |
| `npm run staff:create` | Create/update a staff account with specified role |

Provision an administrator in a trusted shell:

```bash
ADMIN_NAME="Staff name" ADMIN_EMAIL="staff@example.com" ADMIN_PASSWORD="use-a-long-unique-password" npm run admin:create
```

Create a staff member with a limited role:

```bash
STAFF_NAME="Menu Manager" STAFF_EMAIL="manager@example.com" STAFF_PASSWORD="use-a-long-unique-password" STAFF_ROLE="MENU_MANAGER" npm run staff:create
```

The scripts accept credentials from environment variables and store a bcrypt password hash. Avoid putting real credentials in shell history or project files.

## 9. External integrations and configuration

### WhatsApp

The order route requires a valid WhatsApp number and returns a `wa.me` URL with a URL-encoded order summary. The customer must send/confirm the message. This implementation does not itself dispatch the message, receive a WhatsApp webhook, or collect a payment.

### Google Business Profile reviews

The helper `src/lib/google-business-reviews.ts` supports reading reviews directly from the Google Business Profile API when configured with server-only OAuth and account/location settings. Required values are `GOOGLE_BUSINESS_CLIENT_ID`, `GOOGLE_BUSINESS_CLIENT_SECRET`, `GOOGLE_BUSINESS_REFRESH_TOKEN`, `GOOGLE_BUSINESS_ACCOUNT_ID`, and `GOOGLE_BUSINESS_LOCATION_ID`; `GOOGLE_BUSINESS_MIN_REVIEW_RATING` is optional and defaults to 4 according to the README. The API response is temporarily cached for ten minutes and is not stored in the application database. Without credentials, the homepage can show visible reviews associated with delivered orders.

### Deployment

The repository includes Vercel-related configuration and is structured for a Next.js deployment. Configure environment variables in the hosting provider, ensure the PostgreSQL database is reachable from the deployment, run Prisma migrations, and then build/start the app. `.github` contains a workflow placeholder; confirm its contents and secrets before relying on it for automated database or deployment work.

## 10. Project structure

```text
src/
  app/                  App Router pages, layouts, metadata, API handlers
    api/                Public and staff API route handlers
    admin/              Staff workspace pages
  components/           Shared UI, cart, mobile, event, admin components
  lib/                  Prisma, menu, auth, pricing, settings, business helpers
  auth.ts               Auth.js configuration
prisma/
  schema.prisma         PostgreSQL data model
scripts/                Staff setup and seed/maintenance utilities
public/                 Images, logos, manifest assets and static content
```

## 11. Important implementation notes and boundaries

- The cart is browser state; the order becomes durable only after successful server submission.
- The server re-reads menu/extra prices rather than trusting browser-submitted prices, which protects the order total from client-side price edits.
- Order creation groups related database writes in a Prisma transaction. The promo record is marked redeemed in that transaction.
- Delivery fee is currently calculated as a fixed GH₵20 in the order API, except where the company has free delivery. The public settings text is editable, but changing displayed text alone does not change the calculation.
- Corporate discount and waitlist promo discounts are applied to the subtotal/delivery calculation in the order API. Review the order and promo handlers before changing promotional rules.
- `Combo` exists in the database schema, but the current public order route shown in this project builds order lines from `MenuItem` IDs. Do not assume schema support means combos are enabled in checkout.
- The API exposes multiple staff roles, but role checks differ across endpoints. Role names alone do not prove which actions each role can perform; inspect the specific API route for authorization.
- `CmsPage` exists in the schema, but a general CMS editor/page system is not among the current documented admin routes.
- The project README describes pending orders as sent to WhatsApp for confirmation. More precisely, the server saves the pending order and returns a WhatsApp link for the customer's browser to open.
- Some source text appears to contain character-encoding artifacts in a few currency and symbol strings. Review affected visible copy if these render incorrectly in the presentation environment.

## 12. Suggested presentation outline

1. **Problem and goal:** Make Rich-Dons dishes and catering easier to discover and order, including office lunch delivery.
2. **Customer experience:** Demonstrate homepage → menu → cart → checkout → WhatsApp confirmation → order tracker.
3. **Business operations:** Demonstrate staff login and explain menu/order/delivery/corporate management.
4. **Architecture:** Introduce Next.js, React, Prisma, PostgreSQL, Auth.js, and WhatsApp handoff.
5. **Data and reliability:** Explain the order, item snapshot, payment, delivery, status, and transactional creation model.
6. **Security and scope:** Explain staff role checks, hashed passwords, server-side price validation, and the external WhatsApp payment boundary.
7. **Future development:** Potentially add payment gateway/webhook support, stronger customer order access, automated deployment checks, expanded tests, and configurable fee rules.

## 13. Reference files

- [`README.md`](README.md) — concise setup and deployment notes.
- [`package.json`](package.json) — dependencies and npm commands.
- [`prisma/schema.prisma`](prisma/schema.prisma) — database schema.
- [`src/auth.ts`](src/auth.ts) — staff credential authentication.
- [`src/lib/authz.ts`](src/lib/authz.ts) — shared role checks.
- [`src/app/api/orders/route.ts`](src/app/api/orders/route.ts) — checkout validation and order creation.
- [`src/lib/menu.ts`](src/lib/menu.ts) — public menu queries.
- [`src/lib/kitchen-hours.ts`](src/lib/kitchen-hours.ts) — Accra kitchen-hour logic.
- [`src/lib/whatsapp.ts`](src/lib/whatsapp.ts) — WhatsApp link creation.
