"use client";
import { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const Orb = ({
  totalImages = 30,
  totalItems = 60,
  baseWidth = 1,
  baseHeight = 0.6,
  sphereRadius = 5,
  verticalOffset = 0.3,
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || !containerRef.current) return;

    let mounted = true;
    let animationId = null;
    const meshes = [];

    const scene = new THREE.Scene();
    const orbGroup = new THREE.Group();
    orbGroup.position.y = -verticalOffset;
    scene.add(orbGroup);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 1.2;
    controls.minDistance = 6;
    controls.maxDistance = 10;
    controls.enableZoom = true;
    controls.enablePan = false;

    const animate = () => {
      if (!mounted) return;
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 256;

    const radius = 10;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(canvas.width - radius, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
    ctx.lineTo(canvas.width, canvas.height - radius);
    ctx.quadraticCurveTo(
      canvas.width,
      canvas.height,
      canvas.width - radius,
      canvas.height
    );
    ctx.lineTo(radius, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();

    const sharedAlphaMap = new THREE.CanvasTexture(canvas);

    const textureLoader = new THREE.TextureLoader();

    const getRandomImagePath = () =>
      `/lookbook/orb_img_${Math.floor(Math.random() * totalImages) + 1}.jpg`;

    const loadImageMesh = (phi, theta) => {
      textureLoader.load(
        getRandomImagePath(),
        (texture) => {
          if (!mounted) {
            texture.dispose();
            return;
          }

          const imageAspect = texture.image.width / texture.image.height;
          let width = baseWidth;
          let height = baseHeight;

          if (imageAspect > 1) {
            height = width / imageAspect;
          } else {
            width = height * imageAspect;
          }

          texture.colorSpace = THREE.SRGBColorSpace;
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;

          const geometry = new THREE.PlaneGeometry(width, height);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            alphaMap: sharedAlphaMap,
            depthWrite: true,
            depthTest: true,
          });

          const mesh = new THREE.Mesh(geometry, material);

          mesh.position.x = sphereRadius * Math.cos(theta) * Math.sin(phi);
          mesh.position.y = sphereRadius * Math.sin(theta) * Math.sin(phi);
          mesh.position.z = sphereRadius * Math.cos(phi);

          mesh.lookAt(0, 0, 0);
          mesh.rotateY(Math.PI);

          if (mounted) {
            orbGroup.add(mesh);
            meshes.push({ mesh, geometry, material, texture });
          } else {
            geometry.dispose();
            material.dispose();
            texture.dispose();
          }
        },
        undefined,
        (error) => {
          if (mounted) {
          }
        }
      );
    };

    for (let i = 0; i < totalItems; i++) {
      const phi = Math.acos(-1 + (2 * i) / totalItems);
      const theta = Math.sqrt(totalItems * Math.PI) * phi;
      loadImageMesh(phi, theta);
    }

    const handleResize = () => {
      if (!mounted) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      mounted = false;

      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      window.removeEventListener("resize", handleResize);

      meshes.forEach(({ mesh, geometry, material, texture }) => {
        if (mesh.parent) {
          mesh.parent.remove(mesh);
        }
        geometry.dispose();
        material.dispose();
        texture.dispose();
      });

      if (sharedAlphaMap) {
        sharedAlphaMap.dispose();
      }

      if (controls) {
        controls.dispose();
      }

      if (renderer) {
        if (containerRef.current && renderer.domElement) {
          containerRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }

      sceneRef.current = null;
    };
  }, [
    isReady,
    totalImages,
    totalItems,
    baseWidth,
    baseHeight,
    sphereRadius,
    verticalOffset,
  ]);

  return <div ref={containerRef} className="orb" />;
};

export default Orb;
