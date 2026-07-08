import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/workspace",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
