import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.morpho.org https://api.openai.com https://rpc.mainnet.chain.robinhood.com https://robinhood-mainnet.g.alchemy.com",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  images: {
    formats: ["image/avif", "image/webp"],
    // Brand assets must remain available in both vinext development and the
    // Cloudflare Worker build, where the compatibility image endpoint is not
    // guaranteed to be present.
    unoptimized: true,
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
