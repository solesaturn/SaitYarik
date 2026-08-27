import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/constructor", destination: "/kit", permanent: true }];
  },
};

export default nextConfig;
