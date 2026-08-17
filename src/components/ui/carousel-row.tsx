// src/components/ui/carousel-row.tsx
export function CarouselRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 -mx-4 px-4 scroll-smooth">
      {children}
    </div>
  );
}
