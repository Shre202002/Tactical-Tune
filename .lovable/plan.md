
# TacticalTune Phase 2 — Backend, Auth, Admin, PDP

Big scope. I'll ship it in one sequenced batch — each step depends on the previous.

## 1. Auth & Roles (DB)
- Migration 1:
  - `app_role` enum: `super_admin`, `admin`, `customer`
  - `profiles` (id=auth.users, email, full_name, phone, avatar_url) + auto-create trigger on `auth.users` insert
  - `user_roles` (user_id, role) + unique
  - `has_role(uuid, app_role)` security-definer fn
  - Bootstrap trigger: when `sriyanshgupta24@gmail.com` signs up, auto-grant `super_admin`
  - RLS: profiles self-read/update + admins read all; user_roles self-read + super_admin manage
  - Tighten existing `categories`/`products`: keep public read, add admin INSERT/UPDATE/DELETE via `has_role`
- Enable Google OAuth via `configure_social_auth` (user said they'll provide their own creds — managed default works to start)

## 2. Orders & Cart schema
Migration 2:
- `carts` (user_id unique, status: active/abandoned/converted)
- `cart_items` (cart_id, product_id, qty, unit_price)
- `orders` (user_id, status: pending_payment/paid/failed/cancelled/fulfilled, totals, shipping_address jsonb, razorpay_order_id, razorpay_payment_id)
- `order_items` (order_id, product_id snapshot fields, qty, unit_price, line_total)
- `promos` (code, percent_off / flat_off, valid_from/to, max_uses, is_active) + admin-managed
- RLS: users see own carts/orders; admins see all
- Trigger: on cart inactivity >24h set status=abandoned (handled by query, not cron, for now)

## 3. Storage bucket for product images
- Create public `product-images` bucket
- RLS: public read, admin write
- Migrate existing AI-generated category images already in `src/assets` are fine for the homepage. For seeded product rows with external `invincibleone.in` URLs, generate fresh hosted images for the 10 products and upload to the bucket, then update rows to point at the public URLs.

## 4. Product Detail Page `/products/$slug`
- Route file `src/routes/products.$slug.tsx`
- Public SSR: server publishable client, narrow SELECT
- Layout: gallery (main image + thumbs), title, brand, price + compare-at, stock badge, short desc, "Add to cart" + "Buy now", specs table, full description, SEO `head()` from `seo_title`/`seo_description`
- `errorComponent` + `notFoundComponent`
- Wire `BestSellers` and `Categories` cards to link here

## 5. Auth UI
- Public `/auth` route: email/password + Google button (`lovable.auth.signInWithOAuth("google")`)
- Public `/auth/callback` for OAuth return
- Integration-managed `_authenticated/route.tsx` layout
- Navbar: shows Sign in or avatar dropdown (Account, Orders, Admin if role, Sign out) — wires `onAuthStateChange` in `__root.tsx`

## 6. Customer area
- `/_authenticated/account` — profile edit
- `/_authenticated/orders` — list user's orders + statuses
- `/_authenticated/cart` — cart view (cart persisted in DB once signed in)

## 7. Admin area `/_authenticated/admin/*`
Gated by `has_role(uid, 'admin') OR has_role(uid, 'super_admin')`:
- `/admin` dashboard: counts (orders by status, abandoned carts, pending payments, revenue)
- `/admin/products` CRUD + image upload to `product-images` bucket (signed upload via server fn)
- `/admin/categories` CRUD
- `/admin/promos` CRUD
- `/admin/orders` table with filter by status (incl. abandoned-cart and pending-payment views)
- `/admin/customers` super-admin-only full customer detail (profile + orders + carts)

## 8. Data cleanup
- Update seeded products: rewrite `images` JSONB to hosted bucket URLs
- Keep all 10 (user said "keep them")

## Technical notes
- All server reads/writes use `createServerFn`; admin actions use `requireSupabaseAuth` + role check; admin product writes use `supabaseAdmin` imported inside handler
- Razorpay payment wiring is NOT in this turn — orders sit in `pending_payment` until a future Razorpay integration. The admin dashboard already shows that bucket.
- Cart persistence: signed-out users use localStorage; on sign-in we merge into DB cart
- Image generation: 10 product images via imagegen (premium for labels), uploaded to bucket via `storage_upload`

## Out of scope this turn
- Razorpay checkout flow (tables ready; wiring next turn after you provide keys)
- Email notifications
- Search/filter on /products listing page (PDP only this turn)
- Reviews

Confirm and I'll execute the whole sequence.
