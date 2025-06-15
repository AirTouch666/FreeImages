import fs from 'fs';
import path from 'path';
import { defaultConfig, ConfigType } from './config.template';

// 配置文件路径
const CONFIG_FILE_PATH = path.join(process.cwd(), 'freeimages.config.json');

/**
 * 服务器端配置管理器
 * 负责从文件系统读写配置
 */
export class ServerConfigManager {
  /**
   * 获取配置
   * 如果配置文件不存在，则创建默认配置
   */
  static getConfig(): ConfigType {
    try {
      // 检查配置文件是否存在
      if (!fs.existsSync(CONFIG_FILE_PATH)) {
        // 创建默认配置
        ServerConfigManager.saveConfig(defaultConfig);
        return defaultConfig;
      }

      // 读取配置文件
      const configData = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const config = JSON.parse(configData) as ConfigType;

      // 合并默认配置，确保所有字段都存在
      return ServerConfigManager.deepMerge(defaultConfig, config);
    } catch (error) {
      console.error('读取配置文件失败:', error);
      return defaultConfig;
    }
  }

  /**
   * 保存配置到文件
   * @param config 配置对象
   */
  static saveConfig(config: ConfigType): void {
    try {
      const configData = JSON.stringify(config, null, 2);
      fs.writeFileSync(CONFIG_FILE_PATH, configData, 'utf-8');
    } catch (error) {
      console.error('保存配置文件失败:', error);
    }
  }

  /**
   * 更新配置
   * @param partialConfig 部分配置
   */
  static updateConfig(partialConfig: Partial<ConfigType>): ConfigType {
    const currentConfig = ServerConfigManager.getConfig();
    const newConfig = ServerConfigManager.deepMerge(currentConfig, partialConfig);
    ServerConfigManager.saveConfig(newConfig);
    return newConfig;
  }

  /**
   * 获取图片域名列表
   * 包括R2域名和自定义域名
   */
  static getImageDomains(): string[] {
    const config = ServerConfigManager.getConfig();
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
  }

  /**
   * 获取图片格式
   */
  static getImageFormats(): string[] {
    const config = ServerConfigManager.getConfig();
    return config.app.images.formats;
  }

  /**
   * 深度合并对象
   * @param target 目标对象
   * @param source 源对象
   */
  private static deepMerge<T>(target: T, source: Partial<T>): T {
    const output = { ...target };
    
    if (ServerConfigManager.isObject(target) && ServerConfigManager.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (ServerConfigManager.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = ServerConfigManager.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }

  /**
   * 检查值是否为对象
   */
  private static isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}

// 导出单例方法
export const getServerConfig = ServerConfigManager.getConfig;
export const updateServerConfig = ServerConfigManager.updateConfig;
export const getImageDomains = ServerConfigManager.getImageDomains;
export const getImageFormats = ServerConfigManager.getImageFormats; 