"use client";
import "./home.css";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

import { products } from "./wardrobe/products";
import Preloader, { isInitialLoad } from "@/components/Preloader/Preloader";
import DotMatrix from "@/components/DotMatrix/DotMatrix";
import BrandIcon from "@/components/BrandIcon/BrandIcon";
import MarqueeBanner from "@/components/MarqueeBanner/MarqueeBanner";
import TextBlock from "@/components/TextBlock/TextBlock";
import PeelReveal from "@/components/PeelReveal/PeelReveal";
import CTA from "@/components/CTA/CTA";

import Copy from "@/components/Copy/Copy";
import Product from "@/components/Product/Product";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Index() {
  const [loaderAnimating, setLoaderAnimating] = useState(isInitialLoad);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const heroImgRef = useRef(null);
  const heroHeaderRef = useRef(null);
  const heroSectionRef = useRef(null);

  const handlePreloaderComplete = () => {
    setLoaderAnimating(false);
  };

  useEffect(() => {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    setFeaturedProducts(shuffled.slice(0, 4));
  }, []);

  useGSAP(() => {
    if (!heroImgRef.current || !heroHeaderRef.current) return;

    gsap.set(heroImgRef.current, { y: 1000 });
    gsap.to(heroImgRef.current, {
      y: 0,
      duration: 0.75,
      ease: "power3.out",
      delay: isInitialLoad ? 5.75 : 1,
    });

    gsap.to(heroHeaderRef.current, {
      y: 150,
      ease: "none",
      scrollTrigger: {
        trigger: heroSectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  return (
    <>
      <Preloader onAnimationComplete={handlePreloaderComplete} />

      <section className="hero" ref={heroSectionRef}>
        <DotMatrix
          color="#969992"
          dotSize={2}
          spacing={5}
          opacity={0.9}
          delay={isInitialLoad ? 6 : 1.125}
        />
        <div className="container">
          <div className="hero-header" ref={heroHeaderRef}>
            <Copy animateOnScroll={false} delay={isInitialLoad ? 5.5 : 0.65}>
              <h1>Silhouettes for the Next Era</h1>
            </Copy>
          </div>
        </div>
        <div className="hero-img" ref={heroImgRef}>
          <img src="/home/hero.png" alt="" />
        </div>
        <div className="section-footer">
          <Copy
            type="flicker"
            delay={isInitialLoad ? 7.5 : 0.65}
            animateOnScroll={false}
          >
            <p>Void Index</p>
          </Copy>
          <Copy
            type="flicker"
            delay={isInitialLoad ? 7.5 : 0.65}
            animateOnScroll={false}
          >
            <p>Model v.23</p>
          </Copy>
        </div>
      </section>

      <section className="about">
        <div className="container">
          <div className="about-copy">
            <Copy type="flicker">
              <p>Clothing reduced to pure signal</p>
            </Copy>
            <Copy>
              <h3>
                Our collections are built for the frictionless, the fast, and
                the quietly defiant.
              </h3>
            </Copy>
            <div className="about-icon">
              <BrandIcon />
            </div>
          </div>
        </div>
        <div className="section-footer light">
          <Copy type="flicker">
            <p>/ Core State /</p>
          </Copy>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <div className="featured-products-header">
            <Copy type="flicker">
              <p>Featured Units</p>
            </Copy>
            <Copy>
              <h3>
                Selected <br /> Garments
              </h3>
            </Copy>
          </div>
          <div className="featured-products-separator">
            <div className="featured-products-divider"></div>
            <div className="featured-products-labels">
              <Copy type="flicker">
                <p>Primary Set</p>
              </Copy>
              <Copy type="flicker">
                <Link href="/wardrobe">View Archive</Link>
              </Copy>
            </div>
          </div>
          <div className="featured-products-list">
            {featuredProducts.map((product) => (
              <Product
                key={product.name}
                product={product}
                productIndex={products.indexOf(product) + 1}
                showAddToCart={true}
              />
            ))}
          </div>
        </div>
      </section>

      <MarqueeBanner />

      <TextBlock />

      <PeelReveal />

      <CTA />
    </>
  );
}
