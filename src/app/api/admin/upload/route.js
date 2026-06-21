import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase";

function sanitizeSegment(input = "") {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const slugRaw = formData.get("slug") || "product";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "A valid file is required." },
        { status: 400 }
      );
    }

    const slug = sanitizeSegment(String(slugRaw));
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const fileName = `${Date.now()}-${sanitizeSegment(file.name.replace(/\.[^/.]+$/, ""))}.${ext}`;
    const filePath = `${slug}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const admin = createAdminClient();
    const { error } = await admin.storage
      .from("products")
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) throw error;

    const { data: publicData } = admin.storage.from("products").getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      path: filePath,
      imageUrl: publicData.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to upload image." },
      { status: 500 }
    );
  }
}
