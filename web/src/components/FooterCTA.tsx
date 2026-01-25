"use client";

import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const footerLinks = [
  "About",
  "Careers",
  "Press",
  "Legal",
  "Support",
  "Twitter",
  "Instagram",
  "TikTok",
];

export function FooterCTA() {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section id="download" className="footer-cta">
      <div className="footer-bg-circles">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className="footer-content">
        <h2
          ref={ref}
          className={`footer-headline line-reveal ${isVisible ? "animate" : ""}`}
        >
          <span className="word-stack line-item">STOP</span>
          <span className="word-stack outline line-item">WAITING</span>
          <span className="word-stack text-[var(--pink)] glitch-intense line-item">START</span>
          <span className="word-stack line-item">
            <span className="coconut-spin">🥥</span>PAYING
          </span>
        </h2>

        <p className="footer-subtext">
          Join the community commerce revolution. Your people are already here.
          What are you waiting for?
        </p>

        <div className="footer-cta-buttons">
          <Link href="#" className="app-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            App Store
          </Link>
          <Link href="#" className="app-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
            </svg>
            Google Play
          </Link>
        </div>

        <div className="footer-links">
          {footerLinks.map((link) => (
            <Link key={link} href="#" className="footer-link">
              {link}
            </Link>
          ))}
        </div>

        <p className="copyright">
          © 2024 CocoPay Inc. All rights reserved. 🥥
        </p>
      </div>
    </section>
  );
}
