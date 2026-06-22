import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

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

    // ── File type validation ──────────────────────────────────────────────
    const mimeType = file.type || "";
    if (!ALLOWED_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          error: `File type "${mimeType}" is not allowed. Only JPEG, PNG, WebP, and GIF images are accepted.`,
        },
        { status: 400 }
      );
    }

    // ── File size validation ──────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        {
          error: `File is too large (${sizeMB} MB). Maximum allowed size is 5 MB.`,
        },
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
        contentType: mimeType,
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
      { error: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
