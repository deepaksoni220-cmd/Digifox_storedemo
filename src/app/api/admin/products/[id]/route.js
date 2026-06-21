import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../../lib/supabase";

function normalizeSlug(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const admin = createAdminClient();
    const body = await request.json();

    const payload = {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.slug !== undefined ? { slug: normalizeSlug(body.slug) } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.price !== undefined ? { price: Number(body.price) } : {}),
      ...(body.mrp !== undefined ? { mrp: body.mrp ? Number(body.mrp) : null } : {}),
      ...(body.color !== undefined ? { color: body.color } : {}),
      ...(body.sizes !== undefined ? { sizes: Array.isArray(body.sizes) ? body.sizes : [] } : {}),
      ...(body.category_id !== undefined ? { category_id: body.category_id } : {}),
      ...(body.image_url !== undefined ? { image_url: body.image_url } : {}),
      ...(body.product_images !== undefined ? { product_images: Array.isArray(body.product_images) ? body.product_images : [] } : {}),
      ...(body.in_stock !== undefined ? { in_stock: !!body.in_stock } : {}),
    };

    if (payload.name && !payload.slug) {
      payload.slug = normalizeSlug(payload.name);
    }

    const { data, error } = await admin
      .from("products")
      .update(payload)
      .eq("id", id)
      .select("*, categories(name, slug)")
      .single();

    if (error) throw error;
    return NextResponse.json({ product: data });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    const { error } = await admin.from("products").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete product." },
      { status: 500 }
    );
  }
}
