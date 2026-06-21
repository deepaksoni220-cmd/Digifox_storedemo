import { NextResponse } from "next/server";
import { getProductBySlug, getRelatedProducts } from "../../../../lib/supabase";
import { products as localProducts } from "../../../wardrobe/products";
import { enrichLocalProduct, toSlug } from "../../../../lib/productUtils";

/**
 * GET /api/products/[slug]
 * Returns a single product by slug + 4 related products.
 *
 * Falls back to local products.js when Supabase products table is empty.
 */
export async function GET(_request, { params }) {
  const { slug } = await params;

  try {
    // ── Try Supabase first ────────────────────────────────────────────────
    let product = null;
    let related = [];
    let source = "supabase";

    try {
      product = await getProductBySlug(slug);
      related = await getRelatedProducts(slug, 4);
    } catch (_err) {
      // Not found in Supabase — try local fallback
    }

    // ── Fall back to local products.js ────────────────────────────────────
    if (!product) {
      source = "local";
      const idx = localProducts.findIndex((p) => toSlug(p.name) === slug);
      if (idx === -1) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      product = enrichLocalProduct(localProducts[idx], idx + 1);

      // Pick 4 random related products (excluding current)
      const others = localProducts
        .filter((_, i) => i !== idx)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      related = others.map((p, i) => enrichLocalProduct(p, localProducts.indexOf(p) + 1));
    }

    return NextResponse.json({ product, related, source });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}
