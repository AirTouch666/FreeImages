/**
 * FreeImages 配置模板
 * 
 * 此文件包含应用的所有配置项及其默认值
 * 请勿直接修改此文件，系统会根据此模板自动生成配置
 */

// 存储配置
export const storageConfig = {
  // Cloudflare R2 配置
  cloudflare: {
    accountId: '',
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: '',
    publicDomain: '', // 例如: pub-xxxxx.r2.dev 或 自定义域名
  },
  
  // 上传设置
  upload: {
    path: 'uploads/',
    maxSize: 10, // MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
};

// 应用配置
export const appConfig = {
  // 基本设置
  site: {
    title: 'FreeImages',
    description: '简单易用的图床应用',
    theme: 'light', // light, dark, system
    url: 'http://localhost:3000', // 应用URL
  },
  
  // 安全设置
  security: {
    adminPassword: 'admin', // 默认管理员密码
  },

  // 图片优化设置
  images: {
    domains: [], // 允许的图片域名，会自动添加R2域名
    formats: ['image/avif', 'image/webp'], // 支持的图片格式
  }
};

// 导出默认配置
export const defaultConfig = {
  storage: storageConfig,
  app: appConfig,
};

// 配置类型
export type StorageConfigType = typeof storageConfig;
export type AppConfigType = typeof appConfig;
export type ConfigType = {
  storage: StorageConfigType;
  app: AppConfigType;
}; 