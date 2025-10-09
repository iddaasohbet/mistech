"use client";

import React, { useMemo, useState } from "react";
import clsx from "clsx";

type RatingStarsProps = {
  seed: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  canRate?: boolean; // if false, stars are read-only
};

function hashStringToInt(seed: string): number {
  // sdbm hash
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = char + (hash << 6) + (hash << 16) - hash;
    hash |= 0; // force 32-bit
  }
  return Math.abs(hash);
}

function generateDeterministicRating(seed: string): { rating: number; count: number } {
  const base = hashStringToInt(seed);
  // Pseudo-random in [3.2, 4.9]
  const rating = 3.2 + ((base % 1700) / 1700) * (4.9 - 3.2);
  // Pseudo-random review count in [12, 420]
  const count = 12 + (base % 409);
  // Round rating to 1 decimal for display
  return { rating: Math.round(rating * 10) / 10, count };
}

function getSizeClasses(size: "sm" | "md" | "lg") {
  switch (size) {
    case "lg":
      return "h-6 w-6";
    case "md":
      return "h-5 w-5";
    default:
      return "h-4 w-4";
  }
}

export default function RatingStars({ seed, className, size = "md", showValue = true, canRate = true }: RatingStarsProps) {
  const { rating: seedRating, count: seedCount } = useMemo(() => generateDeterministicRating(seed), [seed]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  const displayAvg = useMemo(() => {
    if (userRating == null) return seedRating;
    return Math.round(((seedRating * seedCount + userRating) / (seedCount + 1)) * 10) / 10;
  }, [seedRating, seedCount, userRating]);

  const displayCount = userRating == null ? seedCount : seedCount + 1;
  const starSize = getSizeClasses(size);

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <div className={clsx("flex items-center", canRate ? "" : "opacity-90")}
           aria-label={showValue ? `Ortalama ${displayAvg.toFixed(1)} yıldız` : undefined}
      >
        {Array.from({ length: 5 }).map((_, idx) => {
          const activeUpTo = hover ?? userRating ?? Math.round(displayAvg);
          const isActive = idx < activeUpTo;
          return (
            <button
              key={idx}
              type="button"
              aria-label={`${idx + 1} yıldız ver`}
              disabled={!canRate}
              title={!canRate ? "Puanlamak için giriş yapın" : undefined}
              className={clsx("p-0.5", canRate ? "cursor-pointer" : "cursor-not-allowed")}
              onMouseEnter={() => canRate && setHover(idx + 1)}
              onMouseLeave={() => canRate && setHover(null)}
              onClick={() => canRate && setUserRating(idx + 1)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isActive ? "#f5b301" : "none"}
                stroke={isActive ? "#f5b301" : "currentColor"}
                strokeWidth="2"
                className={clsx(starSize)}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.56a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.482 20.497a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.56a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </button>
          );
        })}
      </div>
      {showValue && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{displayAvg.toFixed(1)}</span>
          <span> ({displayCount} değerlendirme)</span>
        </div>
      )}
    </div>
  );
}


