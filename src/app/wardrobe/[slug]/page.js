"use client";
import "../../unit/unit.css";
import "./product-detail.css";
import { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Copy from "../../../components/Copy/Copy";
import Product from "../../../components/Product/Product";
import { ProductSkeletonGrid } from "../../../components/ProductSkeleton/ProductSkeleton";
import { useCartStore } from "../../../store/cartStore";
import { COLOR_MAP } from "../../../lib/productUtils";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Static gallery shots used as fallback when no Supabase Storage images exist
const SHOT_COUNT = 5;
const shotSrc = (n) => `/product/product_shot_0${n}.jpg`;
const miniSrc = (n) => `/product/product_minimap_0${n}.jpg`;

export default function ProductDetail() {
  const { slug }    = useParams();
  const router      = useRouter();
  const heroRef     = useRef(null);
  const activeMinimapIndex = useRef(0);
  const addToCart   = useCartStore((state) => state.addToCart);

  /** @type {[any|null, Function]} */
  const [product, setProduct]         = useState(null);
  const [related, setRelated]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);

  // ── Fetch product + related ──────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    window.scrollTo(0, 0);

    fetch(`/api/products/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Product not found");
        return r.json();
      })
      .then(({ product: p, related: rel }) => {
        setProduct(p);
        setRelated(rel || []);
        setSelectedSize(p?.sizes?.[0] || null);
        setLoading(false);
      })
      .catch(() => {
        // Redirect to wardrobe if product not found
        router.replace("/wardrobe");
      });
  }, [slug, router]);

  // ── GSAP scroll-pinned gallery (same as /unit) ───────────────────────────
  useGSAP(
    () => {
      if (!product || !heroRef.current) return;

      const snapshots     = document.querySelectorAll(".product-snapshot");
      const minimapImages = document.querySelectorAll(".product-snapshot-minimap-img");
      const total         = snapshots.length;
      if (!total) return;

      gsap.set(snapshots[0], { y: "0%", scale: 1 });
      gsap.set(minimapImages[0], { scale: 1.25 });
      for (let i = 1; i < total; i++) {
        gsap.set(snapshots[i], { y: "100%", scale: 1 });
        gsap.set(minimapImages[i], { scale: 1 });
      }

      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: `+=${window.innerHeight * Math.max(0, total - 1)}`,
        pin: total > 1,
        pinSpacing: total > 1,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          let currentActive = 0;

          for (let i = 1; i < total; i++) {
            const start = (i - 1) / (total - 1);
            const end   = i / (total - 1);
            const local = Math.max(0, Math.min(1, (progress - start) / (end - start)));

            gsap.set(snapshots[i],     { y: `${100 - local * 100}%` });
            gsap.set(snapshots[i - 1], { scale: 1 + local * 0.5 });
            if (local >= 0.5) currentActive = i;
          }

          if (currentActive !== activeMinimapIndex.current) {
            gsap.to(minimapImages[currentActive], { scale: 1.25, duration: 0.3, ease: "power2.out" });
            for (let i = 0; i < currentActive; i++)
              gsap.to(minimapImages[i], { scale: 0, duration: 0.3, ease: "power2.out" });
            for (let i = currentActive + 1; i < total; i++)
              gsap.to(minimapImages[i], { scale: 1, duration: 0.3, ease: "power2.out" });
            activeMinimapIndex.current = currentActive;
          }
        },
      });

      ScrollTrigger.refresh();

      return () => { ScrollTrigger.getAll().forEach((t) => t.kill()); };
    },
    { dependencies: [product], revertOnUpdate: true }
  );

  // ── Add to bag ───────────────────────────────────────────────────────────
  const handleAddToBag = () => {
    if (!product) return;
    addToCart({ ...product, size: selectedSize });
  };

  // ── Color swatch hex ─────────────────────────────────────────────────────
  const colorHex = product ? (COLOR_MAP[product.color] || "#969992") : "#969992";

  // ── Build image arrays ────────────────────────────────────────────────────
  let shots = [];
  let minis = [];

  if (product) {
    shots = [product.image_url, ...(product.product_images || [])].filter(Boolean);
    minis = [...shots]; // Use the same images for the minimap
  }

  // Fallbacks if no images are uploaded at all
  if (shots.length === 0) {
    shots = Array.from({ length: SHOT_COUNT }, (_, i) => shotSrc(i + 1));
    minis = Array.from({ length: SHOT_COUNT }, (_, i) => miniSrc(i + 1));
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="container">
          <div className="product-detail-skeleton-hero">
            <div className="pd-skel-img shimmer-block" />
            <div className="pd-skel-meta">
              <div className="pd-skel-line w70 shimmer-block" />
              <div className="pd-skel-line w40 shimmer-block" />
              <div className="pd-skel-line w55 shimmer-block" />
              <div className="pd-skel-line w90 shimmer-block" />
              <div className="pd-skel-btn shimmer-block" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <>
      {/* ── Back breadcrumb ──────────────────────────────────────────────── */}
      <div className="pd-breadcrumb">
        <Link href="/wardrobe">← Wardrobe</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      {/* ── Hero — scroll-pinned gallery ────────────────────────────────── */}
      <section className="product-hero" ref={heroRef}>
        {/* Left: image gallery */}
        <div className="product-hero-col product-snapshots">
          {shots.map((src, i) => (
            <div key={i} className="product-snapshot">
              <img src={src} alt={`${product.name} view ${i + 1}`}
                onError={(e) => { e.currentTarget.src = shotSrc(i + 1); }}
              />
            </div>
          ))}
          {/* Minimap */}
          <div className="product-snapshot-minimap">
            {minis.map((src, i) => (
              <div key={i} className="product-snapshot-minimap-img">
                <img src={src} alt=""
                  onError={(e) => { e.currentTarget.src = miniSrc(i + 1); }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: product meta */}
        <div className="product-hero-col product-meta">
          <div className="product-meta-container">
            {/* Name + price */}
            <div className="product-meta-header">
              <h3>{product.name}</h3>
              <h3>₹{product.price}</h3>
            </div>
            <div className="product-meta-header-divider" />

            {/* Category tag */}
            <p className="pd-tag">
              {product.categories?.name || product.tag || "—"}
            </p>

            {/* Color swatch */}
            <div className="product-color-container">
              <p className="md">Chroma</p>
              <div className="product-colors">
                <div className="product-color" title={product.color}>
                  <span style={{ backgroundColor: colorHex }} />
                </div>
                <p className="md" style={{ marginLeft: "0.5rem", opacity: 0.6 }}>
                  {product.color}
                </p>
              </div>
            </div>

            {/* Size variants */}
            {product.sizes?.length > 0 && (
              <div className="product-sizes-container">
                <p className="md">Form Size</p>
                <div className="product-sizes">
                  {product.sizes.map((size) => (
                    <p
                      key={size}
                      className={`md pd-size ${selectedSize === size ? "selected" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      [ {size} ]
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="bodyCopy pd-description">{product.description}</p>
            )}

            {/* Actions */}
            <div className="product-meta-buttons">
              <button className="primary" onClick={handleAddToBag}>
                Add To Bag{selectedSize ? ` — ${selectedSize}` : ""}
              </button>
              <button className="secondary">Save Item</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Specifications ──────────────────────────────────────────────── */}
      <section className="product-details specifications">
        <div className="product-col product-col-copy">
          <div className="product-col-copy-wrapper">
            <Copy>
              <h4>Specifications</h4>
            </Copy>
            <Copy>
              <p className="bodyCopy lg">
                {product.description ||
                  "Crafted from a midweight brushed cotton blend, this piece offers a soft yet structured feel with a natural drape. Designed for all-season versatility, it balances comfort with clean utility details throughout the silhouette."}
              </p>
            </Copy>
          </div>
        </div>
        <div className="product-col product-col-img">
          <img src={shots[2] || shots[0] || shotSrc(3)} alt={product.name}
            onError={(e) => { e.currentTarget.src = shotSrc(3); }}
          />
        </div>
      </section>

      {/* ── Shipping ────────────────────────────────────────────────────── */}
      <section className="product-details shipping-details">
        <div className="product-col product-col-img">
          <img src={shots[3] || shots[1] || shots[0] || shotSrc(4)} alt={product.name}
            onError={(e) => { e.currentTarget.src = shotSrc(4); }}
          />
        </div>
        <div className="product-col product-col-copy">
          <div className="product-col-copy-wrapper">
            <Copy>
              <h4>Shipping Terms</h4>
            </Copy>
            <Copy>
              <p className="bodyCopy lg">
                All orders are processed within 5 business days and shipped via
                tracked courier service. Estimated delivery times vary by region,
                but most domestic shipments arrive within 7 business days.
                You&apos;ll receive a tracking link once your order is dispatched.
              </p>
              <p className="bodyCopy lg">
                We accept returns on unworn items within 14 days of delivery. To
                initiate a return, please contact our support team with your order
                number. Refunds are issued to the original payment method once the
                item is received and inspected.
              </p>
            </Copy>
          </div>
        </div>
      </section>

      {/* ── Related products ────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="related-products">
          <div className="container">
            <div className="related-products-header">
              <h3>Parallel Forms</h3>
            </div>
            <div className="related-products-container">
              <div className="container">
                {related.map((rp, i) => (
                  <Product
                    key={rp.id || rp.name}
                    product={rp}
                    productIndex={rp.local_index || i + 1}
                    showAddToCart={true}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
