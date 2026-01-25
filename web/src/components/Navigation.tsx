"use client";

import Link from "next/link";
import { ScrambleText } from "./ScrambleText";

export function Navigation() {
  return (
    <nav
      className="nav fixed top-0 left-0 right-0 z-[1000] flex justify-end items-center gap-10 px-8 py-6"
      style={{
        background: `linear-gradient(to bottom,
          rgba(10,10,10,0.95) 0%,
          rgba(10,10,10,0.7) 60%,
          transparent 100%),
          linear-gradient(to right,
          transparent 0%,
          transparent 30%,
          rgba(10,10,10,0.5) 60%,
          rgba(10,10,10,0.8) 100%)`,
      }}
    >
      <Link href="#features" className="nav-link">
        Features
      </Link>
      <Link href="#how-it-works" className="nav-link">
        How It Works
      </Link>
      <Link href="#community" className="nav-link">
        Community
      </Link>
      <Link href="#download" className="cta-btn">
        <ScrambleText text="GET THE APP" />
      </Link>
    </nav>
  );
}
