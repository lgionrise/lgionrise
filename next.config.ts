// next.config.ts — poori file replace/update karo
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.56.1", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ytimg.com" },          // YouTube video thumbnails
      { protocol: "https", hostname: "*.ggpht.com" },           // YouTube channel/user images
    ],
  },
};

export default nextConfig;
