import { cookies } from "next/headers";

const ADMIN_COOKIE = "digifox_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours in seconds

// ── Web Crypto helpers (works in both Edge and Node.js runtimes) ────────────

const encoder = new TextEncoder();

/**
 * Derive the signing secret from env vars using Web Crypto API.
 */
function getSigningSecretBytes() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("Missing ADMIN_PASSWORD env var.");
  return encoder.encode(`digifox_session_salt_${secret}`);
}

/**
 * HMAC-SHA256 sign using Web Crypto API (works in Edge Runtime).
 */
async function hmacSign(message) {
  const keyData = getSigningSecretBytes();
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Timing-safe comparison for two strings.
 * Uses XOR comparison to prevent timing attacks.
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ── Credentials ─────────────────────────────────────────────────────────────

function getExpectedCredentials() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error("Missing ADMIN_USERNAME or ADMIN_PASSWORD environment variables.");
  }

  return { username, password };
}

/**
 * Validate admin credentials using timing-safe comparison.
 */
export function isValidAdminCredentials(username, password) {
  const expected = getExpectedCredentials();
  const usernameMatch =
    username.length === expected.username.length &&
    timingSafeEqual(username, expected.username);
  const passwordMatch =
    password.length === expected.password.length &&
    timingSafeEqual(password, expected.password);
  return usernameMatch && passwordMatch;
}

// ── Session tokens ──────────────────────────────────────────────────────────

/**
 * Create an HMAC-signed session token.
 * Format: "<timestamp>.<signature>"
 */
async function createSessionToken() {
  const timestamp = String(Date.now());
  const signature = await hmacSign(timestamp);
  return `${timestamp}.${signature}`;
}

/**
 * Verify an HMAC-signed session token.
 * Checks both the signature validity and the expiry time.
 */
export async function verifySessionToken(token) {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestamp, providedSignature] = parts;
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return false;

  // Check expiry
  const ageMs = Date.now() - ts;
  if (ageMs < 0 || ageMs > SESSION_MAX_AGE * 1000) return false;

  // Verify HMAC signature
  const expectedSignature = await hmacSign(timestamp);
  return timingSafeEqual(providedSignature, expectedSignature);
}

// ── Cookie management ───────────────────────────────────────────────────────

/**
 * Set the admin session cookie with an HMAC-signed token.
 */
export async function setAdminSession() {
  const cookieStore = await cookies();
  const token = await createSessionToken();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Clear the admin session cookie.
 */
export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Check whether the current request has a valid admin session.
 */
export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}
