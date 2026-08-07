// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ServiceWorkerRegister } from "@/components/providers/service-worker-register";

export const metadata: Metadata = {
  title: "Learn and Grow",
  description: "Live classes, batches, and tests — Learn and Grow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LGIONRISE",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,        // native app feel — user can't pinch-zoom the UI
  userScalable: false,
  themeColor: "#4F46E5",  // Android status bar color matches app theme
  viewportFit: "cover",   // full-bleed on notch/punch-hole screens
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 overscroll-none">
        <QueryProvider>{children}</QueryProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
