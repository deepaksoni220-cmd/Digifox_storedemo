import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase";

export async function GET() {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("orders")
      .select(`
        id,
        status,
        subtotal,
        shipping_fee,
        total,
        notes,
        created_at,
        updated_at,
        customers (
          first_name,
          last_name,
          email
        ),
        order_items (
          id,
          product_name,
          quantity,
          price,
          size,
          subtotal
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ orders: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders." },
      { status: 500 }
    );
  }
}
