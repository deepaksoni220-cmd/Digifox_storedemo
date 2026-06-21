"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") || "/admin/dashboard";

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed.");

      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <div className="space-y-1">
        <label htmlFor="username" className="block text-xs font-medium text-base-600">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={form.username}
          onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
          className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm outline-none ring-base-400/30 transition-all focus:border-base-500 focus:ring-2"
          placeholder="Enter your username"
          autoComplete="username"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-xs font-medium text-base-600">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm outline-none ring-base-400/30 transition-all focus:border-base-500 focus:ring-2"
          placeholder="••••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-300/50 bg-red-50/80 px-4 py-3">
          <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-base-700 px-4 py-3.5 text-sm font-semibold text-base-100 transition-all hover:bg-base-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-2.5 text-sm text-base-600 transition hover:bg-base-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Signing out..." : "Logout"}
    </button>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-base-100 text-base-700">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,130,110,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial_gradient(circle_at_bottom_left,rgba(100,110,90,0.08),transparent_40%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-base-300 to-transparent" />
      </div>

      {/* Login Container */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center">
            <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-base-700 shadow-xl">
              <span className="text-xl font-bold tracking-[0.25em] text-base-100">DF</span>
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-base-500">
              Digifox Control
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight">Admin Login</h1>
            <p className="mt-3 text-sm text-base-500">
              Access your operations dashboard to manage
              <br className="hidden sm:block" />
              products, orders, and customers.
            </p>
          </div>

          {/* Login Form Card */}
          <div className="mt-8 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-panel sm:p-8">
            {/* Demo Credentials */}
            <div className="mb-6 rounded-xl border border-base-300/60 bg-base-50/80 p-4">
              <p className="text-xs font-medium text-base-600">Demo Credentials</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-base-500">Username:</span>
                <code className="rounded-lg bg-base-200 px-3 py-1.5 font-mono text-base-700">admin</code>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-base-500">Password:</span>
                <code className="rounded-lg bg-base-200 px-3 py-1.5 font-mono text-base-700">admin123</code>
              </div>
            </div>

            <Suspense fallback={<p className="mt-6 text-sm text-base-500">Loading login...</p>}>
              <AdminLoginForm />
            </Suspense>

            {/* Logout Option */}
            <div className="mt-4 border-t border-base-300 pt-4">
              <p className="mb-3 text-center text-xs text-base-500">
                Already logged in?
              </p>
              <LogoutButton />
            </div>
          </div>

          {/* Back to Store */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-base-500 transition hover:text-base-700"
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
