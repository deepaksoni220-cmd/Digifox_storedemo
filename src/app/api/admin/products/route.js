import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase";

function normalizeSlug(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("products")
      .select("*, categories(name, slug)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ products: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch products." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = createAdminClient();
    const body = await request.json();

    const slug = normalizeSlug(body.slug || body.name || "");
    if (!body.name || !slug || body.price === undefined) {
      return NextResponse.json(
        { error: "Name, slug (or name), and price are required." },
        { status: 400 }
      );
    }

    const { data, error } = await admin
      .from("products")
      .insert({
        name: body.name,
        slug,
        description: body.description || "",
        price: Number(body.price),
        mrp: body.mrp ? Number(body.mrp) : null,
        color: body.color || null,
        sizes: Array.isArray(body.sizes) ? body.sizes : [],
        category_id: body.category_id || null,
        image_url: body.image_url || null,
        product_images: Array.isArray(body.product_images) ? body.product_images : [],
        in_stock: body.in_stock ?? true,
      })
      .select("*, categories(name, slug)")
      .single();

    if (error) throw error;
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to create product." },
      { status: 500 }
    );
  }
}
