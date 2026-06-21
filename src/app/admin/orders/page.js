"use client";

import { useEffect, useState } from "react";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

function getStatusConfig(status = "") {
  const s = status.toLowerCase();
  if (s === "delivered")   return { cls: "adm-badge-success", dot: "#10b981" };
  if (s === "cancelled" || s === "refunded") return { cls: "adm-badge-danger", dot: "#ef4444" };
  if (s === "shipped")     return { cls: "adm-badge-info",    dot: "#38bdf8" };
  if (s === "processing" || s === "confirmed") return { cls: "adm-badge-warning", dot: "#f59e0b" };
  return { cls: "adm-badge-neutral", dot: "#64748b" };
}

function avatarColor(name = "") {
  const colors = ["#6c63ff","#a78bfa","#10b981","#f59e0b","#ef4444","#38bdf8","#ec4899"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(first = "", last = "") {
  return `${first[0] || "?"}${last[0] || ""}`.toUpperCase();
}

const STATUS_COLORS = {
  delivered:  { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  cancelled:  { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  refunded:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  shipped:    { color: "#38bdf8", bg: "rgba(56,189,248,0.1)" },
  processing: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  confirmed:  { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  pending:    { color: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load orders.");
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  async function updateStatus(orderId, status) {
    try {
      setError("");
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status.");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: data.order.status } : o))
      );
      setSuccess("Order status updated.");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setError(err.message || "Status update failed.");
    }
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const pendingCount = orders.filter((o) => ["pending","processing","confirmed"].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-breadcrumb">
          <span>Admin</span>
          <span className="adm-breadcrumb-sep">›</span>
          <span style={{ color: "var(--adm-accent)" }}>Orders</span>
        </div>
        <h1 className="adm-page-title">Order Management</h1>
        <p className="adm-page-subtitle">Track, update, and manage all customer orders.</p>
      </div>

      {/* Quick Stats */}
      {!loading && orders.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { label: "Total Orders", value: orders.length, color: "#6c63ff", bg: "rgba(108,99,255,0.1)" },
            { label: "Pending / Active", value: pendingCount, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
            { label: "Delivered", value: deliveredCount, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
          ].map((s) => (
            <div key={s.label} className="adm-card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "var(--font-host-grotesk), sans-serif" }}>
                {s.value}
              </div>
              <p style={{ fontSize: 12, color: "var(--adm-text-muted)", margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="adm-alert-error" style={{ marginBottom: 16 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "var(--adm-success-bg)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 9, padding: "11px 14px", fontSize: 13, color: "var(--adm-success)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {success}
        </div>
      )}

      {/* Orders Table */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <p className="adm-card-title">All Orders</p>
            {!loading && (
              <p className="adm-card-subtitle">
                {orders.length} order{orders.length !== 1 ? "s" : ""} · ₹{totalRevenue.toLocaleString("en-IN")} total revenue
              </p>
            )}
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Order ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}>
                        <div className="adm-skeleton" style={{ height: 13, width: j === 0 ? 120 : j === 4 ? 80 : 60 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td className="adm-table-empty" colSpan={6}>No orders found</td>
                </tr>
              ) : (
                orders.map((order) => {
                  const first = order.customers?.first_name || "";
                  const last = order.customers?.last_name || "";
                  const fullName = `${first} ${last}`.trim() || "Unknown";
                  const statusCfg = getStatusConfig(order.status);
                  const statusColors = STATUS_COLORS[order.status?.toLowerCase()] || STATUS_COLORS.pending;
                  const isExpanded = expandedId === order.id;
                  const itemCount = (order.order_items || []).length;

                  return (
                    <>
                      <tr
                        key={order.id}
                        style={{ cursor: itemCount > 0 ? "pointer" : "default" }}
                        onClick={() => itemCount > 0 && setExpandedId(isExpanded ? null : order.id)}
                      >
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
                          <span style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 11, color: "var(--adm-text-muted)", background: "var(--adm-bg)", border: "1px solid var(--adm-border)", padding: "2px 7px", borderRadius: 5 }}>
                            #{order.id.slice(0, 8)}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, color: "var(--adm-text-muted)" }}>
                            {itemCount} item{itemCount !== 1 ? "s" : ""}
                            {itemCount > 0 && (
                              <span style={{ marginLeft: 5, color: "var(--adm-accent)", fontSize: 10 }}>
                                {isExpanded ? "▲" : "▼"}
                              </span>
                            )}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, fontSize: 13 }}>
                          ₹{Number(order.total || 0).toLocaleString("en-IN")}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: statusColors.bg, border: `1px solid ${statusColors.color}33`, borderRadius: 20, padding: "4px 10px" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColors.color, flexShrink: 0 }} />
                            <select
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value)}
                              className="adm-status-select"
                              style={{ color: statusColors.color, background: "transparent" }}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s} style={{ background: "var(--adm-card)", color: "var(--adm-text)" }}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td style={{ color: "var(--adm-text-muted)", fontSize: 12 }}>
                          {new Date(order.created_at).toLocaleDateString("en-IN")}
                        </td>
                      </tr>

                      {/* Expanded Items Row */}
                      {isExpanded && (
                        <tr key={`${order.id}-items`}>
                          <td colSpan={6} style={{ padding: "0 16px 14px", background: "rgba(108,99,255,0.04)" }}>
                            <div style={{ borderTop: "1px solid var(--adm-border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                              {(order.order_items || []).map((item) => (
                                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                                  <span style={{ color: "var(--adm-text)" }}>
                                    {item.product_name}
                                    <span style={{ color: "var(--adm-text-muted)", marginLeft: 6 }}>× {item.quantity}</span>
                                  </span>
                                  <span style={{ color: "var(--adm-text-muted)" }}>
                                    ₹{Number((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
