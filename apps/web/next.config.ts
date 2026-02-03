import type { NextConfig } from "next";

// Lazily load the bundle analyzer so `next dev` works even when
// `@next/bundle-analyzer` is not installed (useful in CI or minimal dev setups).
let withBundleAnalyzer: (c: NextConfig) => NextConfig = (c) => c;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bundleAnalyzer = require("@next/bundle-analyzer");
  const enableAnalyzer = process.env.ANALYZE === "true";
  withBundleAnalyzer = enableAnalyzer ? bundleAnalyzer({ enabled: true }) : (c: NextConfig) => c;
} catch (err) {
  // If optional dependency is missing, fall back silently.
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },
  async rewrites() {
    const apiTarget = process.env.API_PROXY_TARGET;

    if (!apiTarget) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
  turbopack: {
    // Silence monorepo root warning; use this app as root
    root: __dirname,
  },
};

export default withBundleAnalyzer(nextConfig);
