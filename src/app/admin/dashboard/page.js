"use client";

import { useEffect, useMemo, useState } from "react";

function formatINR(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getStatusConfig(status = "") {
  const s = status.toLowerCase();
  if (s === "delivered")
    return { cls: "adm-badge-success", dot: "#10b981", label: "Delivered" };
  if (s === "cancelled" || s === "refunded")
    return { cls: "adm-badge-danger", dot: "#ef4444", label: status };
  if (s === "shipped")
    return { cls: "adm-badge-info", dot: "#38bdf8", label: "Shipped" };
  if (s === "processing" || s === "confirmed")
    return { cls: "adm-badge-warning", dot: "#f59e0b", label: status };
  if (s === "pending")
    return { cls: "adm-badge-neutral", dot: "#64748b", label: "Pending" };
  return { cls: "adm-badge-neutral", dot: "#64748b", label: status };
}

function avatarColor(name = "") {
  const colors = [
    "#6c63ff","#a78bfa","#10b981","#f59e0b","#ef4444","#38bdf8","#ec4899",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(first = "", last = "") {
  return `${first[0] || "?"}${last[0] || ""}`.toUpperCase();
}

const KPI_ICONS = [
  {
    bg: "rgba(108,99,255,0.12)",
    color: "#6c63ff",
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    bg: "rgba(56,189,248,0.12)",
    color: "#38bdf8",
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    bg: "rgba(167,139,250,0.12)",
    color: "#a78bfa",
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    bg: "rgba(245,158,11,0.12)",
    color: "#f59e0b",
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    bg: "rgba(16,185,129,0.12)",
    color: "#10b981",
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

function StatCard({ label, value, sub, iconConfig, loading }) {
  if (loading) {
    return (
      <div className="adm-kpi-card">
        <div className="adm-skeleton" style={{ width: 36, height: 36, marginBottom: 14, borderRadius: 9 }} />
        <div className="adm-skeleton" style={{ height: 26, width: "55%", marginBottom: 8 }} />
        <div className="adm-skeleton" style={{ height: 12, width: "80%" }} />
      </div>
    );
  }

  return (
    <div className="adm-kpi-card">
      <div
        className="adm-kpi-icon"
        style={{ background: iconConfig.bg, color: iconConfig.color }}
      >
        {iconConfig.svg}
      </div>
      <p className="adm-kpi-value">{value}</p>
      <p className="adm-kpi-label">{label}</p>
      {sub && <p className="adm-kpi-sub">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/stats");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load stats.");
        setStats(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const kpis = useMemo(
    () => [
      { label: "Total Products", value: stats?.productsCount ?? 0, sub: "Catalog entries", iconConfig: KPI_ICONS[0] },
      { label: "Total Orders", value: stats?.ordersCount ?? 0, sub: "All-time volume", iconConfig: KPI_ICONS[1] },
      { label: "Customers", value: stats?.customersCount ?? 0, sub: "Unique profiles", iconConfig: KPI_ICONS[2] },
      { label: "Pending / Processing", value: stats?.pendingOrders ?? 0, sub: "Needs fulfillment", iconConfig: KPI_ICONS[3] },
      { label: "Total Revenue", value: formatINR(stats?.totalRevenue ?? 0), sub: "Gross order value", iconConfig: KPI_ICONS[4] },
    ],
    [stats]
  );

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-breadcrumb">
          <span>Admin</span>
          <span className="adm-breadcrumb-sep">›</span>
          <span style={{ color: "var(--adm-accent)" }}>Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h1 className="adm-page-title">Dashboard</h1>
            <p className="adm-page-subtitle">Good day — {dateStr}</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="adm-alert-error" style={{ marginBottom: 20 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="adm-kpi-grid">
        {kpis.map((kpi, i) => (
          <StatCard key={i} {...kpi} loading={loading} />
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <p className="adm-card-title">Recent Orders</p>
            <p className="adm-card-subtitle">Latest activity across all customers</p>
          </div>
          <span className="adm-badge adm-badge-neutral" style={{ fontSize: 11 }}>
            Live Feed
          </span>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Order ID</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5}>
                      <div className="adm-skeleton" style={{ height: 14, width: `${60 + (i * 7) % 30}%` }} />
                    </td>
                  </tr>
                ))
              ) : (stats?.latestOrders || []).length === 0 ? (
                <tr>
                  <td className="adm-table-empty" colSpan={5}>
                    No recent orders found
                  </td>
                </tr>
              ) : (
                (stats?.latestOrders || []).map((order) => {
                  const first = order.customers?.first_name || "";
                  const last = order.customers?.last_name || "";
                  const fullName = `${first} ${last}`.trim() || "Unknown";
                  const statusCfg = getStatusConfig(order.status);
                  return (
                    <tr key={order.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            className="adm-avatar adm-avatar-sm"
                            style={{ background: avatarColor(fullName) }}
                          >
                            {initials(first, last)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--adm-text)", margin: 0 }}>
                              {fullName}
                            </p>
                            <p style={{ fontSize: 11, color: "var(--adm-text-muted)", margin: "2px 0 0" }}>
                              {order.customers?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--font-dm-mono), monospace",
                            fontSize: 11,
                            color: "var(--adm-text-muted)",
                            background: "var(--adm-bg)",
                            border: "1px solid var(--adm-border)",
                            padding: "2px 7px",
                            borderRadius: 5,
                            letterSpacing: "0.03em",
                          }}
                        >
                          #{order.id.slice(0, 8)}
                        </span>
                      </td>
                      <td>
                        <span className={`adm-badge ${statusCfg.cls}`}>
                          <span className="adm-badge-dot" style={{ background: statusCfg.dot }} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>
                        {formatINR(order.total)}
                      </td>
                      <td style={{ color: "var(--adm-text-muted)", fontSize: 12 }}>
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
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
