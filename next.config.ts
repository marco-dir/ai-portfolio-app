import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'diramco.com',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
      },
    ],
  },
};

export default nextConfig;
