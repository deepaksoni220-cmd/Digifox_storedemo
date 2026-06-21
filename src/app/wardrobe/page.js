"use client";
import "./wardrobe.css";
import { useEffect, useRef, useState, useCallback } from "react";

import Product from "../../components/Product/Product";
import { ProductSkeletonGrid } from "../../components/ProductSkeleton/ProductSkeleton";
import Copy from "../../components/Copy/Copy";
import { gsap } from "gsap";

const TAGS   = ["All", "Sheerform", "Functionary", "Deform"];
const COLORS = ["Black", "Stone", "Ice", "Grey", "White"];

export default function Wardrobe() {
  /** @type {[any[], Function]} */
  const [allProducts, setAllProducts]         = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);

  const [activeTag, setActiveTag]     = useState("All");
  const [activeColor, setActiveColor] = useState(null);
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [isAnimating, setIsAnimating] = useState(false);
  const productRefs    = useRef([]);
  const isInitialMount = useRef(true);
  const searchTimeout  = useRef(null);

  // ── Fetch all products from API ──────────────────────────────────────────
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const { products } = await res.json();
        setAllProducts(products);
        setFilteredProducts(products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // ── Client-side filter whenever tag / color / search changes ─────────────
  useEffect(() => {
    if (!allProducts.length) return;

    const q = search.toLowerCase();

    const result = allProducts.filter((p) => {
      const matchTag   = activeTag === "All" || (p.categories?.name || p.tag) === activeTag;
      const matchColor = !activeColor || p.color?.toLowerCase() === activeColor.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);
      return matchTag && matchColor && matchSearch;
    });

    if (isInitialMount.current) {
      setFilteredProducts(result);
      return;
    }

    // Animate out → update → animate in
    setIsAnimating(true);
    gsap.killTweensOf(productRefs.current);
    gsap.to(productRefs.current, {
      opacity: 0,
      scale: 0.5,
      duration: 0.2,
      stagger: 0.03,
      ease: "power3.out",
      onComplete: () => setFilteredProducts(result),
    });
  }, [activeTag, activeColor, search, allProducts]);

  // ── Animate in after filter changes ─────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    productRefs.current = productRefs.current.slice(0, filteredProducts.length);
    gsap.killTweensOf(productRefs.current);
    gsap.fromTo(
      productRefs.current,
      { opacity: 0, scale: 0.5 },
      {
        opacity: 1,
        scale: 1,
        duration: isInitialMount.current ? 0.5 : 0.25,
        stagger: isInitialMount.current ? 0.05 : 0.04,
        ease: "power3.out",
        onComplete: () => {
          setIsAnimating(false);
          isInitialMount.current = false;
        },
      }
    );
  }, [filteredProducts, loading]);

  // ── Debounced search ─────────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(val), 300);
  };

  const handleFilterChange = useCallback(
    (newTag, newColor) => {
      if (isAnimating) return;
      setActiveTag(newTag);
      setActiveColor(newColor);
    },
    [isAnimating]
  );

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section className="products-header">
        <div className="container">
          <Copy animateOnScroll={false} delay={0.65}>
            <h1>Wardrobe Circulation</h1>
          </Copy>

          {/* Search bar */}
          <div className="wardrobe-search-wrap">
            <input
              className="wardrobe-search"
              type="text"
              placeholder="Search products…"
              value={searchInput}
              onChange={handleSearchChange}
              aria-label="Search products"
            />
            {searchInput && (
              <button
                className="wardrobe-search-clear"
                onClick={() => { setSearchInput(""); setSearch(""); }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="products-header-divider" />

          {/* Tag + color filters */}
          <div className="product-filter-bar">
            <div className="filter-bar-header">
              <p className="bodyCopy">Filters</p>
            </div>
            <div className="filter-bar-tags">
              {TAGS.map((tag) => (
                <p
                  key={tag}
                  className={`bodyCopy ${activeTag === tag ? "active" : ""}`}
                  onClick={() => handleFilterChange(tag, activeColor)}
                  style={{ cursor: isAnimating ? "not-allowed" : "pointer" }}
                >
                  {tag}
                </p>
              ))}
            </div>
            <div className="filter-bar-colors">
              {COLORS.map((color) => (
                <span
                  key={color}
                  className={`color-selector ${color.toLowerCase()} ${
                    activeColor === color ? "active" : ""
                  }`}
                  title={color}
                  onClick={() =>
                    handleFilterChange(activeTag, activeColor === color ? null : color)
                  }
                  style={{ cursor: isAnimating ? "not-allowed" : "pointer" }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Product grid ────────────────────────────────────────────────── */}
      <section className="product-list">
        <div className="container">
          {loading ? (
            <ProductSkeletonGrid count={8} />
          ) : error ? (
            <p className="wardrobe-error bodyCopy">
              Could not load products — {error}
            </p>
          ) : filteredProducts.length === 0 ? (
            <p className="wardrobe-empty bodyCopy">
              No products match your selection.
            </p>
          ) : (
            filteredProducts.map((product, index) => (
              <Product
                key={product.id || product.name}
                product={product}
                productIndex={product.local_index || index + 1}
                showAddToCart={true}
                innerRef={(el) => (productRefs.current[index] = el)}
                style={{ opacity: 0, transform: "scale(0.5)" }}
              />
            ))
          )}
        </div>
      </section>
    </>
  );
}
