import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['md.local.juki.app'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.juki.pub',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'juki-judge.s3.us-east-2.amazonaws.com',
        pathname: '/public/user/image/**',
      },
    ],
  },
};

export default nextConfig;
