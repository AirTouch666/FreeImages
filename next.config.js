/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['https://pub-e2329b6c49f542019219e0653d87fc6d.r2.dev'], // 替换为您的R2域名
    formats: ['image/avif', 'image/webp'],
  },
  // 如果需要，可以添加环境变量
  env: {
    // 这些环境变量将在客户端可用，所以不要放敏感信息
    APP_URL: process.env.APP_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig 