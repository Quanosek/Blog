/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: { minimumCacheTTL: 60 },
};

export default nextConfig;
