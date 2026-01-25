"use client";

import { useEffect, useState, useMemo } from "react";

interface TypewriterTextProps {
  text: string;
  delay?: number;
  glitch?: boolean;
}

export function TypewriterText({ text, delay = 0, glitch = false }: TypewriterTextProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const chars = useMemo(() => {
    return text.split("").map((char, i) => ({
      char: char === " " ? "\u00A0" : char,
      delay: delay + i * 25,
    }));
  }, [text, delay]);

  const content = (
    <span className={`typewriter ${animate ? "animate" : ""}`}>
      {chars.map((c, i) => (
        <span
          key={i}
          className="char"
          style={{ animationDelay: `${c.delay}ms` }}
        >
          {c.char}
        </span>
      ))}
    </span>
  );

  if (glitch) {
    return (
      <span className="glitch-wrap" data-text={text}>
        {content}
      </span>
    );
  }

  return content;
}
