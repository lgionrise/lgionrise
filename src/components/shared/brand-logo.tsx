// src/components/shared/brand-logo.tsx
import Image from "next/image";

export function BrandLogo({ size = 64 }: { size?: number }) {
  return (
    <div
      className="bg-white/15 rounded-2xl flex items-center justify-center mx-auto backdrop-blur overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Image src="/logo.png" alt="Learn and Grow" width={size} height={size} className="object-contain p-2" />
    </div>
  );
}
