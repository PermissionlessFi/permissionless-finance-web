import type { NextConfig } from "next";

const NODE_BUILTINS = [
  "fs", "https", "http", "net", "tls", "zlib",
  "path", "stream", "crypto", "os", "url",
  "buffer", "util", "events", "assert", "querystring",
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["pptxgenjs"],
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  // Baseline security headers. HSTS: Vercel manages TLS; adding it here covers
  // the custom domain. frame-ancestors 'none' ≙ X-Frame-Options DENY.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
  // Clean public URLs for the machine-readable (GEO) surfaces, mapped onto the
  // prerendered route handlers. beforeFiles so `/en/10-x.md` is captured BEFORE
  // the `[lang]/[chapter]` page route (which would otherwise 308 it to HTML).
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/:lang(en|zh)/:slug.md", destination: "/api/md/:lang/:slug" },
        { source: "/llms.txt", destination: "/api/llms" },
        { source: "/llms-full-:lang(en|zh).txt", destination: "/api/llms-full/:lang" },
        { source: "/feed.xml", destination: "/api/feed" },
      ],
    };
  },
  webpack: (config, { isServer, webpack: wp }) => {
    if (!isServer) {
      // 1. Strip "node:" prefix so the bare name can be matched by fallback
      config.plugins.push(
        new wp.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );
      // 2. Stub out Node.js built-ins for the browser bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        ...Object.fromEntries(NODE_BUILTINS.map((m) => [m, false])),
      };
    }
    return config;
  },
};

export default nextConfig;
