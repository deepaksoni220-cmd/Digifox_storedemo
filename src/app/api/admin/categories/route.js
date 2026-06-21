import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data: categories, error } = await admin
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("categories")
      .insert([
        {
          name: body.name,
          slug: body.slug || body.name.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^\w-]+/g, ""),
          description: body.description,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ category: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
