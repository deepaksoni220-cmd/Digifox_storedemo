/**
 * Convert a product name into a URL-safe slug.
 * e.g. "Veil Unit" → "veil-unit", "Patch v0.2" → "patch-v02"
 * @param {string} name
 * @returns {string}
 */
export const toSlug = (name) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

/**
 * Color name → CSS hex value map (matches wardrobe filter colors).
 * @type {Record<string, string>}
 */
export const COLOR_MAP = {
  Black: "#121212",
  Stone: "#a49e91",
  Ice: "#bfc4cb",
  Grey: "#686868",
  White: "#ffffff",
};

/**
 * Enrich a local products.js entry with slug + metadata so it
 * matches the shape returned by Supabase.
 * @param {{ name: string; price: string; color: string; tag: string; sizes: string[]; description: string }} product
 * @param {number} index — 1-based product index (for local image paths)
 * @returns {Object}
 */
export function enrichLocalProduct(product, index) {
  return {
    ...product,
    id: `local-${index}`,
    slug: toSlug(product.name),
    category: product.tag,
    in_stock: true,
    image_url: null,           // no Supabase Storage image yet
    local_index: index,        // used to build /products/product_N.png
    categories: { name: product.tag, slug: product.tag.toLowerCase() },
    sizes: product.sizes,
  };
}
