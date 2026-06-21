# Digifox Frontend + Admin Dashboard

Next.js storefront with Supabase-powered ecommerce backend and a protected admin dashboard.

## Features

### Storefront (existing)
- Product listing and detail pages
- Checkout flow
- Public product APIs with local fallback

### Admin Dashboard (added)
- Dashboard statistics (products, orders, customers, revenue)
- Product CRUD
- Order management
- Customer management
- Order status updates
- Product image upload (Supabase Storage)
- Protected admin routes
- Responsive UI
- Tailwind-based admin styling mapped to your existing Digifox palette

---

## Tech Stack

- Next.js (App Router)
- React
- Supabase (`@supabase/supabase-js`)
- Tailwind CSS v4 (for admin UI)

---

## Environment Variables

Create a `.env.local` file in the project root and add:

```bash
# Public Supabase (already used by storefront)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-side admin access
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin panel login credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
```

> Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only. Never expose it to the client.

---

## Supabase Requirements

1. Run `supabase/schema.sql` in Supabase SQL Editor.
2. Ensure a **public** storage bucket named `products` exists for product image upload.
3. Confirm RLS/policies are applied from the schema.

---

## Run Locally

```bash
npm install
npm run dev
```

Open:

- Storefront: `http://localhost:3000`
- Admin Login: `http://localhost:3000/admin/login`
- Admin Dashboard: `http://localhost:3000/admin/dashboard`

---

## Admin Routes

### Pages
- `/admin/login`
- `/admin/dashboard`
- `/admin/products`
- `/admin/orders`
- `/admin/customers`

### API
- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `GET /api/admin/stats`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`
- `GET /api/admin/customers`
- `POST /api/admin/upload`

---

## Notes

- Admin route protection is done via `src/middleware.js` and session cookie `digifox_admin_session`.
- Admin credentials are simple env-based auth intended for controlled environments. For multi-user production auth, migrate to Supabase Auth or another identity provider.
- Tailwind is enabled globally, while existing storefront CSS remains intact.
