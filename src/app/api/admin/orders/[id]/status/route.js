import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../../../lib/supabase";

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select("id,status,updated_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ order: data });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to update order status." },
      { status: 500 }
    );
  }
}
