import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

interface TrueFocusProps {
  sentence?: string;
  separator?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  stacked?: boolean;
}

/** Brackets sit outside the measured word rect by this many px. */
const CORNER_OFFSET = 12;

const CORNERS = [
  { key: "tl", dx: -CORNER_OFFSET, dy: -CORNER_OFFSET },
  { key: "tr", dx: CORNER_OFFSET, dy: -CORNER_OFFSET },
  { key: "bl", dx: -CORNER_OFFSET, dy: CORNER_OFFSET },
  { key: "br", dx: CORNER_OFFSET, dy: CORNER_OFFSET },
] as const;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function TrueFocus({
  sentence = "True Focus",
  separator = " ",
  manualMode = false,
  blurAmount = 5,
  borderColor = "var(--accent)",
  glowColor = "color-mix(in srgb, var(--accent) 55%, transparent)",
  animationDuration = 0.5,
  pauseBetweenAnimations = 1.2,
  stacked = false,
}: TrueFocusProps) {
  const words = sentence.split(separator);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Auto-advance is pure decoration: skip it entirely under reduced motion.
  useEffect(() => {
    if (!manualMode && !prefersReducedMotion()) {
      const interval = setInterval(
        () => {
          setCurrentIndex((prev) => (prev + 1) % words.length);
        },
        (animationDuration + pauseBetweenAnimations) * 1000,
      );
      return () => clearInterval(interval);
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  /** Remeasures the active word. Called on index change, resize and font load. */
  const measureFocusRect = () => {
    const word = wordRefs.current[currentIndex];
    const container = containerRef.current;
    if (!word || !container) return;

    const parentRect = container.getBoundingClientRect();
    const activeRect = word.getBoundingClientRect();

    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height,
    });
  };

  useEffect(() => {
    measureFocusRect();
  }, [currentIndex, words.length]);

  // Zoom, rotation or a late webfont shifts every rect: remeasure.
  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener("resize", measureFocusRect, {
      signal: controller.signal,
    });
    document.fonts?.ready.then(measureFocusRect);
    return () => controller.abort();
  }, [currentIndex, words.length]);

  const handleActivate = (index: number) => {
    if (manualMode) {
      setLastActiveIndex(index);
      setCurrentIndex(index);
    }
  };

  const handleDeactivate = () => {
    if (manualMode) setCurrentIndex(lastActiveIndex ?? 0);
  };

  const reducedMotion = prefersReducedMotion();
  const frameVisible = focusRect.width > 0;

  return (
    <div
      className={`focus-container${stacked ? "stacked" : ""}`}
      ref={containerRef}
    >
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={index}
            className={`focus-word${manualMode ? "manual" : ""}${isActive && !manualMode ? "active" : ""}`}
            style={{
              filter: isActive ? "blur(0px)" : `blur(${blurAmount}px)`,
              transition: reducedMotion
                ? "none"
                : `filter ${animationDuration}s ease`,
            }}
            onMouseEnter={() => handleActivate(index)}
            onMouseLeave={handleDeactivate}
            onFocus={() => handleActivate(index)}
            onBlur={handleDeactivate}
            tabIndex={manualMode ? 0 : undefined}
          >
            <span
              ref={(el) => {
                wordRefs.current[index] = el;
              }}
              style={{ display: "inline-block" }}
            >
              {word}
            </span>
          </span>
        );
      })}

      {/* Frame = four fixed-size brackets; only their position animates
          (transform), so no layout property is ever tweened. */}
      {CORNERS.map(({ key, dx, dy }) => {
        const targetX =
          focusRect.x + (key === "tr" || key === "br" ? focusRect.width : 0);
        const targetY =
          focusRect.y + (key === "bl" || key === "br" ? focusRect.height : 0);
        return (
          <motion.span
            key={key}
            className={`focus-corner focus-corner--${key}`}
            animate={{
              x: targetX + dx,
              y: targetY + dy,
              opacity: frameVisible ? 1 : 0,
            }}
            transition={{ duration: reducedMotion ? 0 : animationDuration }}
            style={
              {
                "--border-color": borderColor,
                "--glow-color": glowColor,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
