import { NextResponse } from "next/server";
import { createOrder } from "../../../lib/supabase";
import { createAdminClient } from "../../../lib/supabase";
import { orderLimiter, applyRateLimit } from "../../../lib/rateLimit";

/**
 * POST /api/orders
 * Body: { customer, address, items }
 * Creates a full order in Supabase (server-side only).
 * - Rate limited: 5 orders per IP per day
 * - Server-side price verification: totals are recalculated from the database
 */
export async function POST(request) {
  try {
    // ── Rate limit check ──────────────────────────────────────────────────
    const rateCheck = applyRateLimit(orderLimiter, request, "orders");
    if (!rateCheck.allowed) {
      return rateCheck.response;
    }

    const body = await request.json();
    const { customer, address, items } = body;

    // ── Input validation ────────────────────────────────────────────────
    if (!customer?.email || !customer?.firstName || !customer?.lastName) {
      return NextResponse.json(
        { error: "Missing required customer fields (email, firstName, lastName)." },
        { status: 400, headers: rateCheck.headers }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400, headers: rateCheck.headers }
      );
    }

    if (!address?.city || !address?.state || !address?.pincode || !address?.line1) {
      return NextResponse.json(
        { error: "Missing required address fields (line1, city, state, pincode)." },
        { status: 400, headers: rateCheck.headers }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required." },
        { status: 400, headers: rateCheck.headers }
      );
    }

    if (items.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 items per order." },
        { status: 400, headers: rateCheck.headers }
      );
    }

    // ── Server-side price verification ──────────────────────────────────
    // Fetch actual prices from the database instead of trusting the client
    const productIds = items
      .map((item) => item.product_id)
      .filter(Boolean);

    let priceMap = {};

    if (productIds.length > 0) {
      const admin = createAdminClient();
      const { data: dbProducts, error: dbErr } = await admin
        .from("products")
        .select("id, price")
        .in("id", productIds);

      if (dbErr) {
        console.error("Price verification DB error:", dbErr.message);
        return NextResponse.json(
          { error: "Could not verify product prices. Please try again." },
          { status: 500, headers: rateCheck.headers }
        );
      }

      priceMap = Object.fromEntries(
        (dbProducts || []).map((p) => [p.id, parseFloat(p.price)])
      );
    }

    // Recalculate subtotal from verified prices
    let verifiedSubtotal = 0;
    for (const item of items) {
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      if (qty > 100) {
        return NextResponse.json(
          { error: `Invalid quantity for "${item.name}". Maximum 100 per item.` },
          { status: 400, headers: rateCheck.headers }
        );
      }

      const verifiedPrice = item.product_id && priceMap[item.product_id] !== undefined
        ? priceMap[item.product_id]
        : parseFloat(item.price);

      if (isNaN(verifiedPrice) || verifiedPrice < 0) {
        return NextResponse.json(
          { error: `Invalid price for "${item.name}".` },
          { status: 400, headers: rateCheck.headers }
        );
      }

      verifiedSubtotal += verifiedPrice * qty;
    }

    // Round to 2 decimal places
    verifiedSubtotal = Math.round(verifiedSubtotal * 100) / 100;
    const verifiedTotal = verifiedSubtotal; // Add shipping/tax logic here if needed

    // ── Create order with verified prices ───────────────────────────────
    const order = await createOrder({
      customer,
      address,
      items,
      subtotal: verifiedSubtotal,
      total: verifiedTotal,
    });

    return NextResponse.json(
      { success: true, orderId: order.id },
      { status: 201, headers: rateCheck.headers }
    );
  } catch (err) {
    console.error("Order creation failed:", err.message);
    return NextResponse.json(
      { error: "Order could not be placed. Please try again." },
      { status: 500 }
    );
  }
}
