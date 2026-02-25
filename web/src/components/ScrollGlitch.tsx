"use client";

import { useEffect, useRef } from "react";

export function ScrollGlitch() {
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY.current);

      if (scrollDiff > 50) {
        document.querySelectorAll(".glitch-wrap").forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.animation = "none";
          void htmlEl.offsetHeight;
          htmlEl.style.animation = "";
        });
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
}
