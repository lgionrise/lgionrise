// src/components/landing/photo-gallery.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Drop your 20-25 images into public/gallery/ named gallery-1.jpg through
// gallery-25.jpg — update TOTAL_IMAGES to match how many you actually add.
const TOTAL_IMAGES = 25;
const images = Array.from({ length: TOTAL_IMAGES }, (_, i) => `/gallery/gallery-${i + 1}.jpg`);

export function PhotoGallery() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setCurrent(((index % images.length) + images.length) % images.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => goTo(current + 1), 3500);
    return () => clearInterval(timer);
  }, [current, isPaused, goTo]);

  const handleManualNav = (index: number) => {
    goTo(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000); // resume auto-slide after a pause
  };

  return (
    <div
      className="relative w-full aspect-[16/10] sm:aspect-[16/7] rounded-2xl overflow-hidden bg-slate-100"
      onTouchStart={() => setIsPaused(true)}
    >
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
        >
          <Image src={src} alt={`Gallery photo ${i + 1}`} fill className="object-cover" priority={i === 0} />
        </div>
      ))}

      <button
        onClick={() => handleManualNav(current - 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
        aria-label="Previous photo"
      >
        <ChevronLeft className="w-5 h-5 text-slate-700" />
      </button>
      <button
        onClick={() => handleManualNav(current + 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
        aria-label="Next photo"
      >
        <ChevronRight className="w-5 h-5 text-slate-700" />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => handleManualNav(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
            aria-label={`Go to photo ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
