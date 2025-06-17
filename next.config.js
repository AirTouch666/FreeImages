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
      try {
        const configData = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
        return JSON.parse(configData);
      } catch (parseError) {
        console.error('解析配置文件失败:', parseError);
      }
    } else {
      console.log('配置文件不存在，使用默认配置');
      // 尝试创建默认配置文件
      try {
        const defaultConfig = {
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
        const configDir = path.dirname(CONFIG_FILE_PATH);
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }
        fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(defaultConfig, null, 2), 'utf-8');
        console.log('已创建默认配置文件');
        return defaultConfig;
      } catch (createError) {
        console.error('创建默认配置文件失败:', createError);
      }
    }
  } catch (error) {
    console.error('读取配置文件失败:', error);
  }
  
  // 如果所有尝试都失败，返回默认配置
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
  try {
    // 确保domains是数组
    const configDomains = Array.isArray(config.app?.images?.domains) 
      ? config.app.images.domains 
      : [];
    
    // 创建新的字符串数组
    const domains = [...configDomains];
    
    // 添加R2域名（如果存在）
    if (config.storage?.cloudflare?.publicDomain) {
      // 移除可能的协议前缀
      const domain = config.storage.cloudflare.publicDomain.replace(/^https?:\/\//, '');
      if (domain && !domains.includes(domain)) {
        domains.push(domain);
      }
    }
    
    return domains;
  } catch (error) {
    console.error('获取图片域名失败:', error);
    return [];
  }
};

// 获取配置
const config = getConfig();
const imageDomains = getImageDomains(config);
const imageFormats = config.app?.images?.formats || ['image/avif', 'image/webp'];

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: imageDomains,
    formats: imageFormats,
  },
  // 环境变量
  env: {
    APP_URL: config.app?.site?.url || process.env.APP_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig 