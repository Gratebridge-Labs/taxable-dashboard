import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
  },
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://api.gettaxable.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
