"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect, useState, useRef } from "react";

const stats = [
  { value: 2.5, symbol: "M+", label: "Active Users" },
  { value: 1.2, symbol: "B", label: "Transferred Monthly", prefix: "$" },
  { value: 400, symbol: "ms", label: "Avg. Transaction Time" },
];

export function SocialProof() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="community" className="social-proof">
      <div className="social-bg-pattern" />

      <div className="social-header">
        <h2
          ref={ref}
          className={`social-title strike-reveal ${isVisible ? "animate" : ""}`}
        >
          <span className="strike-animate">TRUST US</span>
          <br />
          <span className="reveal-after">TRUST THE NUMBERS</span>
        </h2>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatItem key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}

function StatItem({
  value,
  symbol,
  label,
  prefix = "",
}: {
  value: number;
  symbol: string;
  label: string;
  prefix?: string;
}) {
  const { ref, isVisible } = useScrollAnimation(0.5);
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true;
      const duration = 1500;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = value * easeOut;

        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
        }
      };

      setTimeout(() => {
        requestAnimationFrame(animate);
      }, 200);
    }
  }, [isVisible, value]);

  return (
    <div
      ref={ref}
      className="stat-item"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="stat-number" data-symbol={symbol}>
        {prefix}
        {value >= 100 ? Math.round(displayValue) : displayValue.toFixed(1)}
      </div>
      <p className="stat-label">{label}</p>
    </div>
  );
}
