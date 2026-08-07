// src/components/providers/service-worker-register.tsx
"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // silent fail — PWA install just won't be offered, app still works normally
      });
    }
  }, []);

  return null;
}
