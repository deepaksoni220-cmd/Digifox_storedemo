import "./ProductSkeleton.css";

/**
 * Animated skeleton card — shown while products are loading from Supabase.
 * Matches the exact dimensions of the Product card.
 */
const ProductSkeleton = () => (
  <div className="product-skeleton">
    <div className="skeleton-img shimmer" />
    <div className="skeleton-info">
      <div className="skeleton-row">
        <div className="skeleton-text w60 shimmer" />
        <div className="skeleton-text w30 shimmer" />
      </div>
      <div className="skeleton-btn shimmer" />
    </div>
  </div>
);

/**
 * Render N skeleton cards in a grid-compatible wrapper.
 * @param {{ count?: number }} props
 */
export const ProductSkeletonGrid = ({ count = 8 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </>
);

export default ProductSkeleton;
