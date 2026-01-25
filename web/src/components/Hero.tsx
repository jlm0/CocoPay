"use client";

import Link from "next/link";
import { TypewriterText } from "./TypewriterText";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg-text">PAY</div>

      <div className="headline-stack">
        <div className="headline-row">
          <h1 className="headline-main">
            <TypewriterText text="COCO" delay={0} glitch />
          </h1>
          <span className="coconut-float">🥥</span>
        </div>

        <div className="headline-row offset headline-row-offset">
          <h1 className="headline-main text-stroke">
            <TypewriterText text="PAY" delay={80} />
          </h1>
        </div>

        <div className="headline-row offset-2 headline-row-offset-2">
          <span className="text-tiny">
            <TypewriterText text="COMMUNITY" delay={120} />
          </span>
          <h1 className="headline-main text-pink text-rotate">
            <TypewriterText text="COMMERCE" delay={200} />
          </h1>
        </div>
      </div>

      <div className="hero-cta-wrap">
        <Link href="#features" className="hero-cta-link">
          Explore Features <span>→</span>
        </Link>
      </div>

      <div className="scroll-indicator">
        SCROLL TO EXPLORE
      </div>
    </section>
  );
}
