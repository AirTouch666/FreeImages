/** @type {import('next').NextConfig} */
const fs = require('fs');
const path = require('path');

// 配置文件路径
const CONFIG_FILE_PATH = path.join(process.cwd(), 'freeimages.config.json');

// 获取配置
const getConfig = () => {
  try {
    // 检查配置文件是否存在
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      return JSON.parse(configData);
    }
  } catch (error) {
    console.error('读取配置文件失败:', error);
  }
  
  // 如果没有配置文件或读取失败，返回默认配置
  return {
    app: {
      site: {
        url: process.env.APP_URL || 'http://localhost:3000',
      },
      images: {
        domains: [],
        formats: ['image/avif', 'image/webp'],
      }
    },
    storage: {
      cloudflare: {
        publicDomain: '',
      }
    }
  };
};

// 获取图片域名
const getImageDomains = (config) => {
  const domains = [...(config.app.images.domains || [])];
  
  // 添加R2域名（如果存在）
  if (config.storage.cloudflare.publicDomain) {
    // 移除可能的协议前缀
    const domain = config.storage.cloudflare.publicDomain.replace(/^https?:\/\//, '');
    if (!domains.includes(domain)) {
      domains.push(domain);
    }
  }
  
  return domains;
};

// 获取配置
const config = getConfig();
const imageDomains = getImageDomains(config);
const imageFormats = config.app.images.formats || ['image/avif', 'image/webp'];

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: imageDomains,
    formats: imageFormats,
  },
  // 环境变量
  env: {
    APP_URL: config.app.site.url || process.env.APP_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig 