/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  // output: "export",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
