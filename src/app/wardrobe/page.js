"use client";
import "./wardrobe.css";
import { useEffect, useRef, useState } from "react";

import { products } from "./products";
import Product from "@/components/Product/Product";
import Copy from "@/components/Copy/Copy";

import { gsap } from "gsap";

export default function Wardrobe() {
  const [activeTag, setActiveTag] = useState("All");
  const [activeColor, setActiveColor] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isAnimating, setIsAnimating] = useState(false);
  const productRefs = useRef([]);
  const isInitialMount = useRef(true);

  const handleFilterChange = (newTag, newColor) => {
    if (isAnimating) return;
    if (newTag === activeTag && newColor === activeColor) return;

    setIsAnimating(true);
    setActiveTag(newTag);
    setActiveColor(newColor);

    gsap.killTweensOf(productRefs.current);

    gsap.to(productRefs.current, {
      opacity: 0,
      scale: 0.5,
      duration: 0.25,
      stagger: 0.05,
      ease: "power3.out",
      onComplete: () => {
        const filtered = products.filter((product) => {
          if (newTag !== "All" && product.tag !== newTag) return false;
          if (newColor && product.color !== newColor) return false;
          return true;
        });

        setFilteredProducts(filtered);
      },
    });
  };

  useEffect(() => {
    productRefs.current = productRefs.current.slice(0, filteredProducts.length);
    gsap.killTweensOf(productRefs.current);

    gsap.fromTo(
      productRefs.current,
      { opacity: 0, scale: 0.5 },
      {
        opacity: 1,
        scale: 1,
        duration: isInitialMount.current ? 0.5 : 0.25,
        stagger: isInitialMount.current ? 0.05 : 0.05,
        ease: "power3.out",
        onComplete: () => {
          setIsAnimating(false);
          isInitialMount.current = false;
        },
      }
    );
  }, [filteredProducts]);

  return (
    <>
      <section className="products-header">
        <div className="container">
          <Copy animateOnScroll={false} delay={0.65}>
            <h1>Wardrobe Circulation</h1>
          </Copy>
          <div className="products-header-divider"></div>
          <div className="product-filter-bar">
            <div className="filter-bar-header">
              <p className="bodyCopy">Filters</p>
            </div>
            <div className="filter-bar-tags">
              {["All", "Sheerform", "Functionary", "Deform"].map((tag) => (
                <p
                  key={tag}
                  className={`bodyCopy ${activeTag === tag ? "active" : ""}`}
                  onClick={() => handleFilterChange(tag, activeColor)}
                >
                  {tag}
                </p>
              ))}
            </div>
            <div className="filter-bar-colors">
              {["Black", "Stone", "Ice", "Grey", "White"].map((color) => (
                <span
                  key={color}
                  className={`color-selector ${color.toLowerCase()} ${
                    activeColor === color ? "active" : ""
                  }`}
                  onClick={() =>
                    handleFilterChange(
                      activeTag,
                      activeColor === color ? null : color
                    )
                  }
                  style={{ cursor: isAnimating ? "not-allowed" : "pointer" }}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="product-list">
        <div className="container">
          {filteredProducts.map((product, index) => (
            <Product
              key={product.name}
              product={product}
              productIndex={products.indexOf(product) + 1}
              showAddToCart={true}
              innerRef={(el) => (productRefs.current[index] = el)}
              style={{ opacity: 0, transform: "scale(0.5)" }}
            />
          ))}
        </div>
      </section>
    </>
  );
}
