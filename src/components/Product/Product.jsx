"use client";
import "./Product.css";
import Link from "next/link";
import { useCartStore } from "../../store/cartStore";

/**
 * @typedef {{
 *   name: string;
 *   price: string | number;
 *   color?: string;
 *   tag?: string;
 *   sizes?: string[];
 *   description?: string;
 *   slug?: string;
 *   image_url?: string | null;
 *   local_index?: number;
 * }} ProductShape
 */

/**
 * Product card used on the wardrobe listing page.
 * @param {{
 *   product: ProductShape;
 *   productIndex?: number;
 *   showAddToCart?: boolean;
 *   className?: string;
 *   innerRef?: React.Ref<HTMLDivElement>;
 *   style?: React.CSSProperties;
 * }} props
 */
const Product = ({
  product,
  productIndex,
  showAddToCart = true,
  className = "",
  innerRef,
  style,
}) => {
  const addToCart = useCartStore((state) => state.addToCart);

  // ── Slug: use Supabase slug or derive from local_index / name ───────────
  const slug =
    product.slug ||
    product.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  // ── Image: prefer Supabase Storage URL, fall back to local file ─────────
  const localIdx = product.local_index ?? productIndex ?? 1;
  const imageSrc = product.image_url || `/products/product_${localIdx}.png`;

  return (
    <div className={`product ${className}`} ref={innerRef} style={style}>
      <Link href={`/wardrobe/${slug}`} className="product-img">
        <img
          src={imageSrc}
          alt={product.name}
          onError={(e) => {
            // If image fails, show placeholder background
            e.currentTarget.style.display = "none";
          }}
        />
      </Link>
      <div className="product-info">
        <div className="product-info-wrapper">
          <p>{product.name}</p>
          <p>₹{product.price}</p>
        </div>
        {showAddToCart && (
          <button
            className="add-to-cart-btn"
            onClick={() => addToCart({ ...product, slug })}
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default Product;
