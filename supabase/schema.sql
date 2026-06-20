-- ============================================================
-- DIGIFOX STORE — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ────────────────────────────────────────────────────────────
-- 1. CATEGORIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Deform',      'deform',      'Structural distortion layering'),
  ('Sheerform',   'sheerform',   'Translucent and minimal silhouettes'),
  ('Functionary', 'functionary', 'Utility-first technical outerwear')
ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 2. PRODUCTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  color       TEXT,
  sizes       TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url   TEXT,
  in_stock    BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ────────────────────────────────────────────────────────────
-- 3. CUSTOMERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  phone      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ────────────────────────────────────────────────────────────
-- 4. ADDRESSES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  line1       TEXT NOT NULL,
  line2       TEXT,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL,
  pincode     TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'India',
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
-- 5. ORDERS
-- ────────────────────────────────────────────────────────────
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  address_id      UUID REFERENCES addresses(id) ON DELETE SET NULL,
  status          order_status DEFAULT 'pending',
  subtotal        NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping_fee    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ────────────────────────────────────────────────────────────
-- 6. ORDER ITEMS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,     -- snapshot at time of order
  price       NUMERIC(10, 2) NOT NULL,
  quantity    INT NOT NULL CHECK (quantity > 0),
  size        TEXT,
  subtotal    NUMERIC(10, 2) GENERATED ALWAYS AS (price * quantity) STORED,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- Products: public read, service-role write
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Anyone can read products & categories
CREATE POLICY "Public read products"
  ON products FOR SELECT USING (TRUE);

CREATE POLICY "Public read categories"
  ON categories FOR SELECT USING (TRUE);

-- Only service role (backend) can insert orders / customers
-- (Use your Supabase service_role key server-side only)
CREATE POLICY "Service role full access customers"
  ON customers FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access addresses"
  ON addresses FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access orders"
  ON orders FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access order_items"
  ON order_items FOR ALL USING (auth.role() = 'service_role');


-- ────────────────────────────────────────────────────────────
-- HELPFUL INDEXES
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer   ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_addresses_customer ON addresses(customer_id);
