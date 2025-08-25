/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
export default {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  images: {
    unoptimized: true
  },
  eslint: { ignoreDuringBuilds: true }
};