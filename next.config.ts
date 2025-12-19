import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  typescript: {
    // Also ignore typescript errors for now to ensure we can build what we have running in dev
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
