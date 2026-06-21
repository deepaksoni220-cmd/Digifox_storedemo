"use client";

import { useEffect, useState, useMemo } from "react";

const initialForm = {
  id: "",
  name: "",
  slug: "",
  description: "",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load categories.");
      setCategories(data.categories || []);
    } catch (err) {
      setError(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditingId("");
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setForm({
      id: cat.id,
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
    });
    setTimeout(() => {
      document.getElementById("adm-category-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
      };

      const url = isEditing ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category.");

      await loadCategories();
      resetForm();
      setSuccess(isEditing ? "Category updated successfully." : "Category created successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this category? Products in this category might be affected.")) return;
    try {
      setError("");
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete category.");
      
      await loadCategories();
      if (editingId === id) resetForm();
      setSuccess("Category deleted.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-breadcrumb">
          <span>Admin</span>
          <span className="adm-breadcrumb-sep">›</span>
          <span style={{ color: "var(--adm-accent)" }}>Categories</span>
        </div>
        <h1 className="adm-page-title">Category Management</h1>
        <p className="adm-page-subtitle">Organize your products into catalog sections.</p>
      </div>

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

      {/* Content Grid */}
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 360px" }} className="adm-products-grid">
        <style>{`
          @media (max-width: 900px) {
            .adm-products-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Categories Table */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <p className="adm-card-title">All Categories</p>
              {!loading && (
                <p className="adm-card-subtitle">{categories.length} categor{categories.length === 1 ? "y" : "ies"}</p>
              )}
            </div>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name & Slug</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td>
                        <div className="adm-skeleton" style={{ height: 14, width: "60%", marginBottom: 6 }} />
                        <div className="adm-skeleton" style={{ height: 12, width: "40%" }} />
                      </td>
                      <td><div className="adm-skeleton" style={{ height: 14, width: "80%" }} /></td>
                      <td><div className="adm-skeleton" style={{ height: 14, width: 80 }} /></td>
                      <td><div className="adm-skeleton" style={{ height: 28, width: 110, borderRadius: 7 }} /></td>
                    </tr>
                  ))
                ) : categories.length === 0 ? (
                  <tr>
                    <td className="adm-table-empty" colSpan={4}>No categories found</td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} style={editingId === cat.id ? { background: "var(--adm-accent-soft)" } : {}}>
                      <td>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--adm-text)", margin: 0 }}>
                          {cat.name}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--adm-text-muted)", margin: "2px 0 0", fontFamily: "var(--font-dm-mono), monospace" }}>
                          /{cat.slug}
                        </p>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--adm-text-muted)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cat.description || "—"}
                      </td>
                      <td style={{ fontSize: 12, color: "var(--adm-text-muted)" }}>
                        {new Date(cat.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => startEdit(cat)}
                            className="adm-btn adm-btn-ghost adm-btn-sm"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(cat.id)}
                            className="adm-btn adm-btn-danger adm-btn-sm"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Form */}
        <div className="adm-card" id="adm-category-form">
          <div className="adm-card-header">
            <div>
              <p className="adm-card-title">{isEditing ? "Edit Category" : "New Category"}</p>
              <p className="adm-card-subtitle">{isEditing ? "Update category details" : "Create a new product group"}</p>
            </div>
            {isEditing && (
              <button type="button" onClick={resetForm} className="adm-btn adm-btn-ghost adm-btn-sm">
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={onSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="adm-form-group">
              <label className="adm-label">Category Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Outerwear"
                className="adm-input"
                required
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="e.g. outerwear (auto-generated if blank)"
                className="adm-input"
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Category description…"
                className="adm-textarea"
                style={{ minHeight: 120 }}
              />
            </div>

            <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
              <button
                type="submit"
                disabled={saving}
                className="adm-btn adm-btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {saving ? "Saving…" : isEditing ? "Update Category" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
