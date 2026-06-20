import { NextResponse } from "next/server";
import { getProducts } from "@/lib/supabase";
import { products as localProducts } from "@/app/wardrobe/products";
import { enrichLocalProduct } from "@/lib/productUtils";

/**
 * GET /api/products
 * Query params:
 *   ?category=deform       — filter by category slug
 *   ?color=Black           — filter by color
 *   ?search=ghost          — search name + description
 *
 * Returns Supabase products when available, falls back to local products.js.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const color    = searchParams.get("color")    || undefined;
    const search   = searchParams.get("search")   || undefined;

    // ── Try Supabase first ──────────────────────────────────────────────────
    let products = [];
    let source = "supabase";

    try {
      products = await getProducts({ category, color, search });
    } catch (_err) {
      // Supabase unavailable — fall through to local
    }

    // ── Fall back to local products.js ──────────────────────────────────────
    if (!products || products.length === 0) {
      source = "local";
      products = localProducts.map((p, i) => enrichLocalProduct(p, i + 1));

      if (category) {
        products = products.filter(
          (p) => p.categories?.slug === category
        );
      }
      if (color) {
        products = products.filter(
          (p) => p.color?.toLowerCase() === color.toLowerCase()
        );
      }
      if (search) {
        const q = search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
      }
    }

    return NextResponse.json({ products, source });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
