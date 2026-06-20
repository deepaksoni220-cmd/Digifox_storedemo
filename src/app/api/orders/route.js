import { NextResponse } from "next/server";
import { createOrder } from "@/lib/supabase";

/**
 * POST /api/orders
 * Body: { customer, address, items, subtotal, total }
 * Creates a full order in Supabase (server-side only).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { customer, address, items, subtotal, total } = body;

    // Basic validation
    if (!customer?.email || !address?.city || !items?.length) {
      return NextResponse.json(
        { error: "Missing required fields: customer, address, or items." },
        { status: 400 }
      );
    }

    const order = await createOrder({ customer, address, items, subtotal, total });

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (err) {
    console.error("Order creation failed:", err.message);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
