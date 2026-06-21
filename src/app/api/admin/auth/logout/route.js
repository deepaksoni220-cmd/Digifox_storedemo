import { NextResponse } from "next/server";
import { clearAdminSession } from "../../../../../lib/adminAuth";

export async function POST() {
  try {
    await clearAdminSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Logout failed." },
      { status: 500 }
    );
  }
}
