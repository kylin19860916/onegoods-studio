"use client";

import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  return (
    <div>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-float)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={active} alt={name} className="aspect-square h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.slice(0, 4).map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`查看${name}图片 ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={`aspect-square overflow-hidden rounded-[1rem] border bg-white transition-colors ${
                index === activeIndex
                  ? "border-[color:var(--color-accent)]"
                  : "border-[color:var(--color-border)] hover:border-[color:var(--color-accent)]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${name} 图片 ${index + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
