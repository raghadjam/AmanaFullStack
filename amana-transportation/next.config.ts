import type { NextConfig } from "next";

// next.config.ts

const nextConfig = {
  // ... (existing configuration)

  async rewrites() {
    return [
      {
        // This is the local path your client code will fetch from
        source: '/api/amana/:path*',
        // This is the external API endpoint
        destination: 'https://www.amanabootcamp.org/api/fs-classwork-data/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
export default nextConfig;
