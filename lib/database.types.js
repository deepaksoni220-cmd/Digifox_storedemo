/**
 * @fileoverview Supabase Database Types — Digifox Store
 * JSDoc types matching the Supabase schema exactly.
 * If you add TypeScript later, convert these to interfaces.
 */

/**
 * @typedef {Object} Category
 * @property {string} id          - UUID
 * @property {string} name        - e.g. "Deform"
 * @property {string} slug        - URL slug e.g. "deform"
 * @property {string|null} description
 * @property {string} created_at  - ISO timestamp
 */

/**
 * @typedef {Object} Product
 * @property {string}      id
 * @property {string}      name
 * @property {string}      slug
 * @property {string|null} description
 * @property {number}      price
 * @property {string|null} color
 * @property {string[]}    sizes       - e.g. ["S","M","L","XL"]
 * @property {string|null} category_id - FK → categories.id
 * @property {string|null} image_url
 * @property {boolean}     in_stock
 * @property {string}      created_at
 * @property {string}      updated_at
 */

/**
 * @typedef {Object} Customer
 * @property {string}      id
 * @property {string}      email
 * @property {string}      first_name
 * @property {string}      last_name
 * @property {string|null} phone
 * @property {string}      created_at
 * @property {string}      updated_at
 */

/**
 * @typedef {Object} Address
 * @property {string}      id
 * @property {string|null} customer_id - FK → customers.id
 * @property {string}      line1
 * @property {string|null} line2
 * @property {string}      city
 * @property {string}      state
 * @property {string}      pincode
 * @property {string}      country
 * @property {boolean}     is_default
 * @property {string}      created_at
 */

/**
 * @typedef {'pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled'|'refunded'} OrderStatus
 */

/**
 * @typedef {Object} Order
 * @property {string}      id
 * @property {string|null} customer_id - FK → customers.id
 * @property {string|null} address_id  - FK → addresses.id
 * @property {OrderStatus} status
 * @property {number}      subtotal
 * @property {number}      shipping_fee
 * @property {number}      total
 * @property {string|null} notes
 * @property {string}      created_at
 * @property {string}      updated_at
 */

/**
 * @typedef {Object} OrderItem
 * @property {string}      id
 * @property {string}      order_id     - FK → orders.id
 * @property {string|null} product_id   - FK → products.id
 * @property {string}      product_name - Snapshot at purchase time
 * @property {number}      price
 * @property {number}      quantity
 * @property {string|null} size
 * @property {number}      subtotal     - Generated (price × quantity)
 * @property {string}      created_at
 */

/**
 * Full DB shape (mirrors Supabase's generated types structure)
 * @typedef {Object} Database
 * @property {{ categories: Category, products: Product, customers: Customer, addresses: Address, orders: Order, order_items: OrderItem }} public
 */

export {};
