"use client";

import { useEffect, useState } from "react";

function avatarColor(name = "") {
  const colors = ["#6c63ff","#a78bfa","#10b981","#f59e0b","#ef4444","#38bdf8","#ec4899","#fb923c"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(first = "", last = "") {
  return `${first[0] || "?"}${last[0] || ""}`.toUpperCase();
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/admin/customers");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load customers.");
        setCustomers(data.customers || []);
      } catch (err) {
        setError(err.message || "Failed to load customers.");
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
    return name.includes(q) || (c.email || "").toLowerCase().includes(q);
  });

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-breadcrumb">
          <span>Admin</span>
          <span className="adm-breadcrumb-sep">›</span>
          <span style={{ color: "var(--adm-accent)" }}>Customers</span>
        </div>
        <h1 className="adm-page-title">Customer Management</h1>
        <p className="adm-page-subtitle">View and manage all registered customers.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="adm-alert-error" style={{ marginBottom: 16 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Customers Table */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <p className="adm-card-title">All Customers</p>
            {!loading && (
              <p className="adm-card-subtitle">
                {customers.length} registered customer{customers.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--adm-text-muted)"
              strokeWidth="2"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers…"
              className="adm-input"
              style={{ paddingLeft: 30, width: 200, fontSize: 12 }}
            />
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="adm-skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div className="adm-skeleton" style={{ height: 13, width: "55%", marginBottom: 5 }} />
                          <div className="adm-skeleton" style={{ height: 11, width: "70%" }} />
                        </div>
                      </div>
                    </td>
                    <td><div className="adm-skeleton" style={{ height: 12, width: 90 }} /></td>
                    <td><div className="adm-skeleton" style={{ height: 22, width: 36, borderRadius: 20 }} /></td>
                    <td><div className="adm-skeleton" style={{ height: 12, width: 80 }} /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="adm-table-empty" colSpan={4}>
                    {search ? `No customers matching "${search}"` : "No customers found"}
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => {
                  const first = customer.first_name || "";
                  const last = customer.last_name || "";
                  const fullName = `${first} ${last}`.trim() || "Unknown";
                  const orderCount = customer.orders?.length || 0;

                  return (
                    <tr key={customer.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            className="adm-avatar"
                            style={{ background: avatarColor(fullName) }}
                          >
                            {initials(first, last)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--adm-text)", margin: 0 }}>
                              {fullName}
                            </p>
                            <p style={{ fontSize: 11, color: "var(--adm-text-muted)", margin: "2px 0 0" }}>
                              {customer.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--adm-text-muted)" }}>
                        {customer.phone || "—"}
                      </td>
                      <td>
                        {orderCount > 0 ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: 26,
                              height: 22,
                              padding: "0 8px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              background: "var(--adm-accent-soft)",
                              color: "var(--adm-accent)",
                              border: "1px solid rgba(108,99,255,0.25)",
                            }}
                          >
                            {orderCount}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--adm-text-dim)" }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: "var(--adm-text-muted)" }}>
                        {new Date(customer.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
