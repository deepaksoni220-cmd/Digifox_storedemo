import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase";

export async function GET() {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("customers")
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        created_at,
        updated_at,
        orders (
          id,
          total,
          status,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ customers: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch customers." },
      { status: 500 }
    );
  }
}
