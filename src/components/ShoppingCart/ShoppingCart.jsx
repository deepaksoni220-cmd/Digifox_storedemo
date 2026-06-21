"use client";
import "./ShoppingCart.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { products } from "../../app/wardrobe/products";
import { useCartStore, useCartCount, useCartSubtotal } from "../../store/cartStore";

const ShoppingCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const cartCount = useCartCount();
  const subtotal = useCartSubtotal();
  const router = useRouter();

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="shopping-cart-container">
      <a
        className="whatsapp-button"
        href="https://wa.me/918696755996"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span>Message Us</span>
      </a>

      <button className="cart-button" onClick={toggleCart}>
        <span className="cart-icon">BAG</span>
        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
      </button>

      <div
        className={`cart-sidebar ${isOpen ? "open" : ""}`}
        onWheel={(e) => {
          const target = e.currentTarget;
          const cartItems = target.querySelector(".cart-items");
          if (cartItems) {
            const { scrollTop, scrollHeight, clientHeight } = cartItems;
            const isAtTop = scrollTop === 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

            if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
              e.stopPropagation();
            }
          }
        }}
      >
        <div className="cart-sidebar-content">
          <div className="cart-header">
            <h2>Bag</h2>
            <button className="cart-close" onClick={toggleCart}>
              Close
            </button>
          </div>
          <div
            className="cart-items"
            onWheel={(e) => {
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
            }}
          >
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <p>Your bag is empty</p>
              </div>
            ) : (
              cartItems.map((item, index) => {
                const productIndex =
                  products.findIndex((p) => p.name === item.name) + 1;
                const quantity = Number(item.quantity) || 1;
                return (
                  <div key={`${item.name}-${index}`} className="cart-item">
                    <div className="cart-item-image">
                      <img
                        src={`/products/product_${productIndex}.png`}
                        alt={item.name}
                      />
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-name-row">
                        <p className="cart-item-name">{item.name}</p>
                        {quantity > 1 && (
                          <span className="cart-item-quantity">{quantity}</span>
                        )}
                      </div>
                      <p className="cart-item-price">₹{item.price}</p>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.name)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="cart-footer">
              <div className="cart-summary-row">
                <span>Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <button
                className="cart-checkout"
                onClick={() => { setIsOpen(false); router.push("/checkout"); }}
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
