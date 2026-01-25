"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const steps = [
  {
    num: "01",
    title: "Download & Sign Up",
    desc: "30 seconds. Phone number. Done. No lengthy KYC torture.",
  },
  {
    num: "02",
    title: "Invite Friends",
    desc: "Sync contacts or share your link. Build your payment circle.",
  },
  {
    num: "03",
    title: "Start Transacting",
    desc: "Split that dinner. Pool for the trip. Pay back that $5 from 2019.",
  },
  {
    num: "04",
    title: "Earn Together",
    desc: "Community rewards kick in. Your network becomes your net worth.",
  },
];

export function HowItWorks() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-bg">HOW</div>

      <div className="how-header">
        <h2
          ref={ref}
          className={`how-title split-reveal ${isVisible ? "animate" : ""}`}
        >
          <span className="split-left">HOW IT</span>
          <span className="how-title-rotated split-right">WORKS</span>
        </h2>
      </div>

      <div className="steps-container">
        {steps.map((step) => (
          <Step key={step.num} {...step} />
        ))}
      </div>
    </section>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className="step"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s",
      }}
    >
      <div className="step-num">{num}</div>
      <div className="step-content">
        <h3 className="step-title">{title}</h3>
        <p className="step-desc">{desc}</p>
      </div>
      <span className="step-arrow">→</span>
    </div>
  );
}
