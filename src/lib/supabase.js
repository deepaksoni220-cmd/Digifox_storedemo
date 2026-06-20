import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
  );
}

/**
 * Public Supabase client — safe to use in browser & Server Components.
 * Uses the anon key (respects Row Level Security).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-only admin client — bypasses RLS.
 * Use ONLY in Next.js Route Handlers / Server Actions (never expose to browser).
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY — only use this server-side.");
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

// ─── Supabase Storage ──────────────────────────────────────────────────────

const STORAGE_BUCKET = "products";

/**
 * Build a public Supabase Storage URL for a product image.
 * @param {string} slug  — product slug, e.g. "veil-unit"
 * @param {string} [file] — filename, defaults to "main.jpg"
 * @returns {string}
 */
export function getProductImageUrl(slug, file = "main.jpg") {
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${slug}/${file}`;
}

// ─── Product helpers ───────────────────────────────────────────────────────

/**
 * @typedef {{ category?: string; color?: string; search?: string }} ProductFilters
 */

/**
 * Fetch all in-stock products from Supabase with optional filters.
 * @param {ProductFilters} [filters]
 * @returns {Promise<any[]>}
 */
export async function getProducts(filters = {}) {
  const { category, color, search } = filters;

  let query = supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  if (color) {
    query = query.ilike("color", color);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  // Client-side category filter (PostgREST embedded resource filtering is limited)
  if (category && data) {
    return data.filter(
      (p) =>
        p.categories?.slug === category ||
        p.categories?.name?.toLowerCase() === category.toLowerCase()
    );
  }

  return data ?? [];
}

/**
 * Fetch a single product by slug.
 * @param {string} slug
 * @returns {Promise<any>}
 */
export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Fetch related products excluding the current product's slug.
 * @param {string} slug    — current product slug to exclude
 * @param {number} [limit] — max results, default 4
 * @returns {Promise<any[]>}
 */
export async function getRelatedProducts(slug, limit = 4) {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("in_stock", true)
    .neq("slug", slug)
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch all categories ordered by name.
 * @returns {Promise<any[]>}
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

// ─── Order helper ──────────────────────────────────────────────────────────

/**
 * Create a new order (server-side only — uses admin client).
 * @param {{ customer: Object, address: Object, items: Object[], subtotal: number, total: number }} payload
 */
export async function createOrder({ customer, address, items, subtotal, total }) {
  const admin = createAdminClient();

  // 1. Upsert customer by email
  const { data: customerData, error: customerErr } = await admin
    .from("customers")
    .upsert(
      {
        email: customer.email,
        first_name: customer.firstName,
        last_name: customer.lastName,
        phone: customer.phone,
      },
      { onConflict: "email" }
    )
    .select()
    .single();
  if (customerErr) throw customerErr;

  // 2. Insert address
  const { data: addressData, error: addressErr } = await admin
    .from("addresses")
    .insert({
      customer_id: customerData.id,
      line1: address.line1,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    })
    .select()
    .single();
  if (addressErr) throw addressErr;

  // 3. Create order
  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      customer_id: customerData.id,
      address_id: addressData.id,
      subtotal,
      total,
      status: "pending",
    })
    .select()
    .single();
  if (orderErr) throw orderErr;

  // 4. Insert order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id || null,
    product_name: item.name,
    price: parseFloat(item.price),
    quantity: item.quantity || 1,
    size: item.size || null,
  }));

  const { error: itemsErr } = await admin.from("order_items").insert(orderItems);
  if (itemsErr) throw itemsErr;

  return order;
}
