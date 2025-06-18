/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable fully static export
  output: 'export',

  // Serve assets with relative URLs so file:// works
  assetPrefix: './',

  // Your existing settings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
