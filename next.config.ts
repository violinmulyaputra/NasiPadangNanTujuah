import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    // Bukti bayar maksimal 2 MB plus overhead multipart (batas, header part, kolom
    // code dan method). Default 1 MB terlalu kecil. Tetap di bawah batas body
    // fungsi Vercel 4,5 MB.
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
