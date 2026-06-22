import { NextResponse } from "next/server";
import { isValidAdminCredentials, setAdminSession } from "../../../../../lib/adminAuth";
import { loginLimiter, applyRateLimit } from "../../../../../lib/rateLimit";

export async function POST(request) {
  try {
    // ── Rate limit check ──────────────────────────────────────────────────
    const rateCheck = applyRateLimit(loginLimiter, request, "login attempts");
    if (!rateCheck.allowed) {
      return rateCheck.response;
    }

    const body = await request.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400, headers: rateCheck.headers }
      );
    }

    if (!isValidAdminCredentials(username, password)) {
      return NextResponse.json(
        {
          error: "Invalid credentials.",
          attemptsRemaining: parseInt(rateCheck.headers["X-RateLimit-Remaining"]),
        },
        { status: 401, headers: rateCheck.headers }
      );
    }

    await setAdminSession();
    return NextResponse.json({ success: true }, { headers: rateCheck.headers });
  } catch (error) {
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
