"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  {
    number: "01",
    title: "Split Without Drama",
    desc: "Auto-calculate, auto-remind, auto-collect. Because nobody wants to be that person chasing payments in the group chat.",
  },
  {
    number: "02",
    title: "Group Buying Power",
    desc: "Pool money for bulk deals, concert tickets, or that Airbnb. Together you save more.",
  },
  {
    number: "03",
    title: "Zero Fee Transfers",
    desc: "Send to anyone instantly. Your money moves as fast as your memes.",
  },
  {
    number: "04",
    title: "Community Rewards",
    desc: "The more your community uses CocoPay, the more you all earn. A true rewards ecosystem.",
  },
];

export function Features() {
  const { ref, isVisible } = useScrollAnimation(0.2, "0px 0px -100px 0px");

  return (
    <section id="features" className="features">
      <div className="features-header">
        <p className="features-label">Why we&apos;re different</p>
        <h2
          ref={ref}
          className={`features-title split-reveal ${isVisible ? "animate" : ""}`}
        >
          <span className="split-left">BUILT FOR</span>
          <span className="break features-title-break text-green split-right hover-tilt">
            YOUR COMMUNITY
          </span>

        </h2>
      </div>

      <div className="feature-grid">
        {features.map((feature) => (
          <FeatureCard key={feature.number} {...feature} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ number, title, desc }: { number: string; title: string; desc: string }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className="feature-card"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="feature-number">{number}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  );
}
