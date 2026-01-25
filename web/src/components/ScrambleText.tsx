"use client";

import { useState, useRef, useCallback } from "react";

interface ScrambleTextProps {
  text: string;
}

export function ScrambleText({ text }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  const frameRef = useRef<number | null>(null);
  const queueRef = useRef<Array<{
    from: string;
    to: string;
    start: number;
    end: number;
    char?: string;
  }>>([]);
  const frameCountRef = useRef(0);

  const randomChar = useCallback(() => {
    return chars[Math.floor(Math.random() * chars.length)];
  }, []);

  const handleMouseEnter = useCallback(() => {
    const oldText = displayText;
    const newText = text;
    const length = Math.max(oldText.length, newText.length);

    queueRef.current = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      queueRef.current.push({ from, to, start, end });
    }

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    frameCountRef.current = 0;

    const update = () => {
      let output = "";
      let complete = 0;

      for (let i = 0; i < queueRef.current.length; i++) {
        const item = queueRef.current[i];
        if (frameCountRef.current >= item.end) {
          complete++;
          output += item.to;
        } else if (frameCountRef.current >= item.start) {
          if (!item.char || Math.random() < 0.28) {
            item.char = randomChar();
          }
          output += item.char;
        } else {
          output += item.from;
        }
      }

      setDisplayText(output);

      if (complete < queueRef.current.length) {
        frameCountRef.current++;
        frameRef.current = requestAnimationFrame(update);
      }
    };

    frameRef.current = requestAnimationFrame(update);
  }, [displayText, text, randomChar]);

  return (
    <span className="scramble-text relative z-[1]" onMouseEnter={handleMouseEnter}>
      {displayText}
    </span>
  );
}
