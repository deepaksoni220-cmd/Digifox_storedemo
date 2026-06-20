"use client";
import "./checkout.css";
import { useState } from "react";
import Link from "next/link";
import { useCartStore, useCartSubtotal } from "@/store/cartStore";
import { products } from "@/app/wardrobe/products";

export default function Checkout() {
  const cartItems = useCartStore((state) => state.cartItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartSubtotal();

  const [placed, setPlaced] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPlaced(true);
      if (clearCart) clearCart();
    }, 1500);
  };

  if (placed) {
    return (
      <div className="checkout-page">
        <div className="checkout-success">
          <div className="checkout-success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
            </svg>
          </div>
          <h3>Order Placed!</h3>
          <p>
            Thank you for your order. We&apos;ve received your details and will
            be in touch shortly via WhatsApp or email to confirm your shipment.
          </p>
          <Link href="/" className="checkout-success-btn">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-inner">
        {/* ── Shipping Form ── */}
        <div className="checkout-form-section">
          <h5>Shipping Details</h5>
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  name="firstName"
                  type="text"
                  placeholder="Ravi"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  name="lastName"
                  type="text"
                  placeholder="Sharma"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                name="address"
                type="text"
                placeholder="Street, Building, Flat No."
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  name="city"
                  type="text"
                  placeholder="Mumbai"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input
                  name="pincode"
                  type="text"
                  placeholder="400001"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>State</label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                required
              >
                <option value="">Select State</option>
                {[
                  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar",
                  "Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh",
                  "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra",
                  "Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
                  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
                  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir",
                  "Ladakh","Puducherry","Chandigarh","Other",
                ].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="checkout-submit"
              disabled={loading || cartItems.length === 0}
            >
              {loading ? "Placing Order..." : `Place Order — ₹${subtotal.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* ── Order Summary ── */}
        <div className="checkout-summary">
          <h5>Order Summary</h5>

          {cartItems.length === 0 ? (
            <p className="checkout-empty">Your bag is empty.</p>
          ) : (
            <>
              <div className="checkout-summary-items">
                {cartItems.map((item, i) => {
                  const qty = Number(item.quantity) || 1;
                  return (
                    <div key={i} className="checkout-summary-item">
                      <div className="checkout-item-info">
                        <span className="checkout-item-name">{item.name}</span>
                        <span className="checkout-item-qty">Qty: {qty}</span>
                      </div>
                      <span className="checkout-item-price">
                        ₹{(parseFloat(item.price) * qty).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-summary-total">
                <span>Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
