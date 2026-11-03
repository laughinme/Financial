import type { NextConfig } from "next";
const backend = process.env.API_PROXY_URL || "http://localhost:8000";
const config: NextConfig = {
  output: "standalone",
  devIndicators: false,
  turbopack: { root: process.cwd() },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
  async redirects() {
    return [{ source: "/index.html", destination: "/login", permanent: false }];
  },
};
export default config;
