import { Config } from '@/types';

// 默认配置
const DEFAULT_CONFIG: Config = {
  accessKeyId: '',
  secretAccessKey: '',
  bucketName: '',
  uploadPath: 'uploads/',
};

// 保存配置到localStorage
export const saveConfig = (config: Config): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('freeimages-config', JSON.stringify(config));
  }
};

// 从localStorage获取配置
export const getConfig = (): Config => {
  if (typeof window !== 'undefined') {
    const savedConfig = localStorage.getItem('freeimages-config');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig) as Config;
      } catch (e) {
        console.error('Failed to parse config:', e);
      }
    }
  }
  return DEFAULT_CONFIG;
};

// 检查配置是否完整
export const isConfigComplete = (config: Config): boolean => {
  return !!(
    config.accessKeyId &&
    config.secretAccessKey &&
    config.bucketName
  );
}; 