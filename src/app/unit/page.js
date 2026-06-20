"use client";
import "./unit.css";
import { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import { products } from "../wardrobe/products";
import Copy from "@/components/Copy/Copy";
import Product from "@/components/Product/Product";
import { useCartStore } from "@/store/cartStore";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Unit() {
  const heroRef = useRef(null);
  const activeMinimapIndex = useRef(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const addToCart = useCartStore((state) => state.addToCart);
  const pathname = usePathname();

  const currentProduct =
    products.find((p) => p.name === "Veil Unit") || products[14];

  useEffect(() => {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    setRelatedProducts(shuffled.slice(0, 4));
  }, []);

  useEffect(() => {
    if (pathname === "/unit") {
      window.scrollTo(0, 0);

      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  useEffect(() => {
    const handleScrollToTop = () => {
      window.scrollTo(0, 0);
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
    };

    window.addEventListener("scrollToTop", handleScrollToTop);

    return () => {
      window.removeEventListener("scrollToTop", handleScrollToTop);
    };
  }, []);

  useGSAP(() => {
    const snapshots = document.querySelectorAll(".product-snapshot");
    const minimapImages = document.querySelectorAll(
      ".product-snapshot-minimap-img"
    );
    const totalImages = snapshots.length;

    gsap.set(snapshots[0], { y: "0%", scale: 1 });
    gsap.set(minimapImages[0], { scale: 1.25 });
    for (let i = 1; i < totalImages; i++) {
      gsap.set(snapshots[i], { y: "100%", scale: 1 });
      gsap.set(minimapImages[i], { scale: 1 });
    }

    ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: `+=${window.innerHeight * 5}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        let currentActiveIndex = 0;

        for (let i = 1; i < totalImages; i++) {
          const imageStart = (i - 1) / (totalImages - 1);
          const imageEnd = i / (totalImages - 1);

          let localProgress = (progress - imageStart) / (imageEnd - imageStart);
          localProgress = Math.max(0, Math.min(1, localProgress));

          const yValue = 100 - localProgress * 100;
          gsap.set(snapshots[i], { y: `${yValue}%` });

          const scaleValue = 1 + localProgress * 0.5;
          gsap.set(snapshots[i - 1], { scale: scaleValue });

          if (localProgress >= 0.5) {
            currentActiveIndex = i;
          }
        }

        if (currentActiveIndex !== activeMinimapIndex.current) {
          gsap.to(minimapImages[currentActiveIndex], {
            scale: 1.25,
            duration: 0.3,
            ease: "power2.out",
          });

          for (let i = 0; i < currentActiveIndex; i++) {
            gsap.to(minimapImages[i], {
              scale: 0,
              duration: 0.3,
              ease: "power2.out",
            });
          }

          for (let i = currentActiveIndex + 1; i < totalImages; i++) {
            gsap.to(minimapImages[i], {
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          }

          activeMinimapIndex.current = currentActiveIndex;
        }
      },
    });

    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, []);

  return (
    <>
      <section className="product-hero" ref={heroRef}>
        <div className="product-hero-col product-snapshots">
          <div className="product-snapshot">
            <img src="/product/product_shot_01.jpg" alt="" />
          </div>
          <div className="product-snapshot">
            <img src="/product/product_shot_02.jpg" alt="" />
          </div>
          <div className="product-snapshot">
            <img src="/product/product_shot_03.jpg" alt="" />
          </div>
          <div className="product-snapshot">
            <img src="/product/product_shot_04.jpg" alt="" />
          </div>
          <div className="product-snapshot">
            <img src="/product/product_shot_05.jpg" alt="" />
          </div>
          <div className="product-snapshot-minimap">
            <div className="product-snapshot-minimap-img">
              <img src="/product/product_minimap_01.jpg" alt="" />
            </div>
            <div className="product-snapshot-minimap-img">
              <img src="/product/product_minimap_02.jpg" alt="" />
            </div>
            <div className="product-snapshot-minimap-img">
              <img src="/product/product_minimap_03.jpg" alt="" />
            </div>
            <div className="product-snapshot-minimap-img">
              <img src="/product/product_minimap_04.jpg" alt="" />
            </div>
            <div className="product-snapshot-minimap-img">
              <img src="/product/product_minimap_05.jpg" alt="" />
            </div>
          </div>
        </div>
        <div className="product-hero-col product-meta">
          <div className="product-meta-container">
            <div className="product-meta-header">
              <h3>Veil Unit</h3>
              <h3>₹1575</h3>
            </div>
            <div className="product-meta-header-divider"></div>
            <div className="product-color-container">
              <p className="md">Chroma</p>
              <div className="product-colors">
                <div className="product-color">
                  <span></span>
                </div>
              </div>
            </div>
            <div className="product-sizes-container">
              <p className="md">Form Size</p>
              <div className="product-sizes">
                <p className="md selected">[ S ]</p>
                <p className="md">[ M ]</p>
                <p className="md">[ L ]</p>
                <p className="md">[ XL ]</p>
              </div>
            </div>
            <div className="product-meta-buttons">
              <button
                className="primary"
                onClick={() => addToCart(currentProduct)}
              >
                Add To Bag
              </button>
              <button className="secondary">Save Item</button>
            </div>
          </div>
        </div>
      </section>

      <section className="product-details specifications">
        <div className="product-col product-col-copy">
          <div className="product-col-copy-wrapper">
            <Copy>
              <h4>Specifications</h4>
            </Copy>
            <Copy>
              <p className="bodyCopy lg">
                Crafted from a midweight brushed cotton blend, this piece offers
                a soft yet structured feel with a natural drape. Designed for
                all-season versatility, it balances comfort with clean utility
                details throughout the silhouette.
              </p>
              <p className="bodyCopy lg">
                Finished with reinforced stitching and a minimal two-way zip,
                the garment is cut for a relaxed fit with drop shoulders and
                subtle tapering. Tonal hardware and interior binding elevate the
                construction from standard outerwear.
              </p>
            </Copy>
          </div>
        </div>
        <div className="product-col product-col-img">
          <img src="/product/product_shot_03.jpg" alt="" />
        </div>
      </section>

      <section className="product-details shipping-details">
        <div className="product-col product-col-img">
          <img src="/product/product_shot_04.jpg" alt="" />
        </div>
        <div className="product-col product-col-copy">
          <div className="product-col-copy-wrapper">
            <Copy>
              <h4>Shipping Terms</h4>
            </Copy>
            <Copy>
              <p className="bodyCopy lg">
                All orders are processed within 5 business days and shipped via
                tracked courier service. Estimated delivery times vary by
                region, but most domestic shipments arrive within 7 business
                days. You’ll receive a tracking link once your order is
                dispatched.
              </p>
              <p className="bodyCopy lg">
                We accept returns on unworn items within 14 days of delivery. To
                initiate a return, please contact our support team with your
                order number. Refunds are issued to the original payment method
                once the item is received and inspected.
              </p>
            </Copy>
          </div>
        </div>
      </section>

      <section className="related-products">
        <div className="container">
          <div className="related-products-header">
            <h3>Parallel Forms</h3>
          </div>
          <div className="related-products-container">
            <div className="container">
              {relatedProducts.map((product) => (
                <Product
                  key={product.name}
                  product={product}
                  productIndex={products.indexOf(product) + 1}
                  showAddToCart={true}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
