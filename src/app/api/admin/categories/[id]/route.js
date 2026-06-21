import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../../lib/supabase";

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const admin = createAdminClient();

    const updateData = {
      name: body.name,
      description: body.description,
    };

    if (body.slug) {
      updateData.slug = body.slug;
    }

    const { data, error } = await admin
      .from("categories")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ category: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("categories").delete().eq("id", params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
