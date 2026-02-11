import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://reportam-backend-sun4.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
