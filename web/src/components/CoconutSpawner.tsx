"use client";

import { useEffect } from "react";

export function CoconutSpawner() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const coco = document.createElement("div");
      coco.className = "floating-coco";
      coco.textContent = "🥥";
      coco.style.left = `${e.clientX}px`;
      coco.style.top = `${e.clientY}px`;
      coco.style.opacity = "1";
      document.body.appendChild(coco);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 5 + Math.random() * 10;
      const vx = Math.cos(angle) * velocity;
      let vy = Math.sin(angle) * velocity - 10;

      let x = e.clientX;
      let y = e.clientY;
      const gravity = 0.5;
      let rotation = 0;
      const startY = e.clientY;

      const animate = () => {
        x += vx;
        vy += gravity;
        y += vy;
        rotation += 10;

        coco.style.left = `${x}px`;
        coco.style.top = `${y}px`;
        coco.style.transform = `rotate(${rotation}deg)`;
        coco.style.opacity = `${Math.max(0, 1 - (y - startY) / 500)}`;

        if (y < window.innerHeight + 100 && parseFloat(coco.style.opacity) > 0) {
          requestAnimationFrame(animate);
        } else {
          coco.remove();
        }
      };

      requestAnimationFrame(animate);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
