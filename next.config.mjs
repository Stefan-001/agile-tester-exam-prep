/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
// Use GitHub Pages basePath only in production unless explicitly overridden
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isProd ? '/agile-tester-exam-prep' : '');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath,
  assetPrefix: basePath
};

export default nextConfig;