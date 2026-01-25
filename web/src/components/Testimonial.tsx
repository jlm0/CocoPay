"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect, useMemo, useState } from "react";

const quote = "Finally an app that gets how we actually spend money together. No more awkward venmo requests.";

export function Testimonial() {
  const { ref, isVisible } = useScrollAnimation(0.2);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setAnimate(true);
    }
  }, [isVisible]);

  const words = useMemo(() => {
    const wordArray = quote.split(" ");
    let charIndex = 0;

    return wordArray.map((word, wordIndex) => {
      const chars = word.split("").map((char) => {
        const delay = charIndex * 15;
        charIndex++;
        return { char, delay };
      });
      charIndex++;
      return { word, chars, isLast: wordIndex === wordArray.length - 1 };
    });
  }, []);

  return (
    <div className="bg-[var(--black)] py-16 px-8 text-center">
      <p
        ref={ref}
        className={`testimonial-text quote-typewriter ${animate ? "animate" : ""}`}
      >
        {words.map((wordObj, wi) => (
          <span key={wi} className="inline-block whitespace-nowrap">
            {wordObj.chars.map((c, ci) => (
              <span
                key={ci}
                className="char"
                style={{ animationDelay: `${c.delay}ms` }}
              >
                {c.char}
              </span>
            ))}
            {!wordObj.isLast && " "}
          </span>
        ))}
      </p>
      <p className="testimonial-author">
        @maya_finance • 142K followers
      </p>
    </div>
  );
}
