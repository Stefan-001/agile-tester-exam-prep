/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
// Use GitHub Pages basePath only in production unless explicitly overridden
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isProd ? '/agile-tester-exam-prep' : '');

const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  swcMinify: true
};

export default nextConfig;