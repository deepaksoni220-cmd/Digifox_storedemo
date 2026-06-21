"use client";

import { useEffect, useMemo, useState, useRef } from "react";

const initialForm = {
  id: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  mrp: "",
  color: "",
  sizes: "",
  category_id: "",
  image_url: "",
  product_images: [],
  in_stock: true,
};

function avatarColor(name = "") {
  const colors = ["#6c63ff","#a78bfa","#10b981","#f59e0b","#ef4444","#38bdf8"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function ProductInitials({ name }) {
  const initials = (name || "?").substring(0, 2).toUpperCase();
  return (
    <div
      className="adm-product-thumb"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: avatarColor(name),
        fontSize: 13,
        fontWeight: 700,
        color: "#fff",
        fontFamily: "var(--font-host-grotesk), sans-serif",
      }}
    >
      {initials}
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories")
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      if (!productsRes.ok) throw new Error(productsData.error || "Failed to load products.");
      if (!categoriesRes.ok) throw new Error(categoriesData.error || "Failed to load categories.");

      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function resetForm() {
    setForm(initialForm);
    setEditingId("");
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price: product.price ?? "",
      mrp: product.mrp ?? "",
      color: product.color || "",
      sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : "",
      category_id: product.category_id || "",
      image_url: product.image_url || "",
      product_images: Array.isArray(product.product_images) ? product.product_images : [],
      in_stock: !!product.in_stock,
    });
    // Scroll form into view on mobile
    setTimeout(() => {
      document.getElementById("adm-product-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  async function handleUpload(file, isGallery = false) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", form.slug || form.name || "product");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      
      if (isGallery) {
        setForm((prev) => ({ ...prev, product_images: [...prev.product_images, data.imageUrl] }));
      } else {
        setForm((prev) => ({ ...prev, image_url: data.imageUrl }));
      }
    } catch (err) {
      setError(err.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function removeGalleryImage(index) {
    setForm((prev) => ({
      ...prev,
      product_images: prev.product_images.filter((_, i) => i !== index)
    }));
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
        price: Number(form.price),
        mrp: form.mrp ? Number(form.mrp) : null,
        color: form.color || null,
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        category_id: form.category_id || null,
        image_url: form.image_url || null,
        product_images: form.product_images,
        in_stock: !!form.in_stock,
      };

      const url = isEditing ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product.");

      await loadData();
      resetForm();
      setSuccess(isEditing ? "Product updated successfully." : "Product created successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this product? This action cannot be undone.")) return;
    try {
      setError("");
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product.");
      await loadData();
      if (editingId === id) resetForm();
      setSuccess("Product deleted.");
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
          <span style={{ color: "var(--adm-accent)" }}>Products</span>
        </div>
        <h1 className="adm-page-title">Product Management</h1>
        <p className="adm-page-subtitle">Manage your catalog — add, edit, or remove products.</p>
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

        {/* Products Table */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <p className="adm-card-title">All Products</p>
              {!loading && (
                <p className="adm-card-subtitle">{products.length} item{products.length !== 1 ? "s" : ""} in catalog</p>
              )}
            </div>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="adm-skeleton" style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div className="adm-skeleton" style={{ height: 13, width: "60%", marginBottom: 6 }} />
                            <div className="adm-skeleton" style={{ height: 11, width: "40%" }} />
                          </div>
                        </div>
                      </td>
                      <td><div className="adm-skeleton" style={{ height: 13, width: 60 }} /></td>
                      <td><div className="adm-skeleton" style={{ height: 22, width: 72, borderRadius: 20 }} /></td>
                      <td><div className="adm-skeleton" style={{ height: 28, width: 110, borderRadius: 7 }} /></td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td className="adm-table-empty" colSpan={4}>No products found</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} style={editingId === product.id ? { background: "var(--adm-accent-soft)" } : {}}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {product.image_url ? (
                            <div className="adm-product-thumb">
                              <img src={product.image_url} alt={product.name} />
                            </div>
                          ) : (
                            <ProductInitials name={product.name} />
                          )}
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--adm-text)", margin: 0 }}>
                              {product.name}
                            </p>
                            <p style={{ fontSize: 11, color: "var(--adm-text-muted)", margin: "2px 0 0", fontFamily: "var(--font-dm-mono), monospace" }}>
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>
                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                      </td>
                      <td>
                        {product.in_stock ? (
                          <span className="adm-stock-in">In Stock</span>
                        ) : (
                          <span className="adm-stock-out">Out of Stock</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
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
                            onClick={() => onDelete(product.id)}
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

        {/* Product Form */}
        <div className="adm-card" id="adm-product-form">
          <div className="adm-card-header">
            <div>
              <p className="adm-card-title">{isEditing ? "Edit Product" : "New Product"}</p>
              <p className="adm-card-subtitle">{isEditing ? "Update product details" : "Add a product to your catalog"}</p>
            </div>
            {isEditing && (
              <button type="button" onClick={resetForm} className="adm-btn adm-btn-ghost adm-btn-sm">
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={onSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="adm-form-group">
              <label className="adm-label">Product Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Alpha Jacket"
                className="adm-input"
                required
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="e.g. alpha-jacket (auto if blank)"
                className="adm-input"
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Product description…"
                className="adm-textarea"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="adm-form-group">
                <label className="adm-label">Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="0.00"
                  className="adm-input"
                  required
                />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">MRP (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.mrp}
                  onChange={(e) => setForm((p) => ({ ...p, mrp: e.target.value }))}
                  placeholder="0.00"
                  className="adm-input"
                />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Color</label>
                <input
                  value={form.color}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                  placeholder="e.g. Midnight Black"
                  className="adm-input"
                />
              </div>
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Sizes (comma separated)</label>
              <input
                value={form.sizes}
                onChange={(e) => setForm((p) => ({ ...p, sizes: e.target.value }))}
                placeholder="e.g. XS, S, M, L, XL"
                className="adm-input"
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                className="adm-select"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat.slug} value={cat.id || ""}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div className="adm-form-group">
              <label className="adm-label">Main Product Image (Thumbnail)</label>
              <div
                className={`adm-upload-zone${dragging ? " drag-over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleUpload(file, false);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--adm-text-muted)" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {uploading ? (
                  <p>Uploading…</p>
                ) : (
                  <>
                    <p style={{ fontWeight: 600, color: "var(--adm-text)" }}>Drop main image here</p>
                    <p>or click to browse</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e.target.files?.[0], false)}
                />
              </div>
              <input
                value={form.image_url}
                onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
                placeholder="Or paste an image URL"
                className="adm-input"
                style={{ marginTop: 8 }}
              />
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Preview"
                  style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginTop: 8, border: "1px solid var(--adm-border)" }}
                />
              )}
            </div>

            {/* Gallery Upload */}
            <div className="adm-form-group">
              <label className="adm-label">Product Images</label>
              <div
                className="adm-upload-zone"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.multiple = true;
                  input.onchange = async (e) => {
                    const files = Array.from(e.target.files);
                    for (const file of files) {
                      await handleUpload(file, true);
                    }
                  };
                  input.click();
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--adm-text-muted)" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p style={{ fontWeight: 600, color: "var(--adm-text)" }}>Click to add product images</p>
              </div>
              
              {form.product_images.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8, marginTop: 8 }}>
                  {form.product_images.map((url, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img
                        src={url}
                        alt="Product Image"
                        style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 6, border: "1px solid var(--adm-border)" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        style={{
                          position: "absolute", top: -6, right: -6, background: "var(--adm-danger)", color: "#fff",
                          border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label className="adm-checkbox-label">
              <input
                type="checkbox"
                checked={form.in_stock}
                onChange={(e) => setForm((p) => ({ ...p, in_stock: e.target.checked }))}
              />
              In Stock
            </label>

            <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
              <button
                type="submit"
                disabled={saving}
                className="adm-btn adm-btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {saving ? "Saving…" : isEditing ? "Update Product" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
