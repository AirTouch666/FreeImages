/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pub-xxxxx.r2.dev'], // 替换为您的R2域名
    formats: ['image/avif', 'image/webp'],
  },
  // 如果需要，可以添加环境变量
  env: {
    // 这些环境变量将在客户端可用，所以不要放敏感信息
    APP_URL: process.env.APP_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig 