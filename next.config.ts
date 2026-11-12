import type { NextConfig } from "next";

/**
 * Where the Express API lives. The browser never calls it directly: every
 * request goes to this app's own `/api/*`, and Next.js (Vercel in production)
 * forwards it to the backend. Because the browser only ever talks to one
 * origin, the backend's httpOnly session cookie is a first-party cookie and
 * we need no cross-site cookies or CORS preflights.
 */
const API_PROXY_TARGET = (process.env.API_PROXY_TARGET ?? "http://localhost:8080").replace(/\/$/, "");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_PROXY_TARGET}/api/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
