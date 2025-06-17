import { defaultConfig, ConfigType } from './config.template';

/**
 * 客户端配置管理器
 * 负责从API获取和更新配置
 */
class ClientConfigManager {
  private config: ConfigType;
  private initialized: boolean = false;

  constructor() {
    this.config = { ...defaultConfig };
  }

  /**
   * 初始化配置
   * 从API加载配置
   */
  public async init(): Promise<void> {
    if (typeof window !== 'undefined' && !this.initialized) {
      try {
        // 从API获取配置
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          this.config = config;
          console.log('配置已从服务器加载');
        } else {
          const errorData = await response.json();
          console.error('加载配置失败:', errorData);
          throw new Error(errorData.error || '加载配置失败');
        }
      } catch (error) {
        console.error('加载配置失败:', error);
        // 使用默认配置
        this.config = { ...defaultConfig };
      }
      this.initialized = true;
    }
  }

  /**
   * 获取完整配置
   */
  public getConfig(): ConfigType {
    return this.config;
  }

  /**
   * 获取存储配置
   */
  public getStorageConfig() {
    return this.getConfig().storage;
  }

  /**
   * 获取应用配置
   */
  public getAppConfig() {
    return this.getConfig().app;
  }

  /**
   * 更新配置
   * @param newConfig 新配置（部分或全部）
   */
  public async updateConfig(newConfig: Partial<ConfigType>): Promise<void> {
    try {
      console.log('正在更新配置:', JSON.stringify(newConfig));
      
      // 发送到API
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
        credentials: 'include', // 包含cookie
      });

      if (response.ok) {
        // 更新本地配置
        const updatedConfig = await response.json();
        this.config = updatedConfig;
        console.log('配置已成功更新');
      } else {
        const errorData = await response.json();
        console.error('更新配置失败:', errorData);
        throw new Error(errorData.error || '更新配置失败');
      }
    } catch (error) {
      console.error('更新配置失败:', error);
      throw error;
    }
  }

  /**
   * 更新存储配置
   */
  public updateStorageConfig(storageConfig: Partial<ConfigType['storage']>): Promise<void> {
    // 获取当前配置
    const currentConfig = this.getConfig();
    // 合并配置，确保完整性
    const mergedStorage = {
      cloudflare: {
        ...currentConfig.storage.cloudflare,
        ...(storageConfig.cloudflare || {})
      },
      upload: {
        ...currentConfig.storage.upload,
        ...(storageConfig.upload || {})
      }
    };
    return this.updateConfig({ storage: mergedStorage });
  }

  /**
   * 更新应用配置
   */
  public updateAppConfig(appConfig: Partial<ConfigType['app']>): Promise<void> {
    // 获取当前配置
    const currentConfig = this.getConfig();
    // 合并配置，确保完整性
    const mergedApp = {
      site: {
        ...currentConfig.app.site,
        ...(appConfig.site || {})
      },
      security: {
        ...currentConfig.app.security,
        ...(appConfig.security || {})
      },
      images: {
        ...currentConfig.app.images,
        ...(appConfig.images || {})
      }
    };
    return this.updateConfig({ app: mergedApp });
  }

  /**
   * 检查配置是否完整
   * 主要检查必要的存储配置是否已设置
   */
  public isConfigComplete(): boolean {
    const { cloudflare } = this.getStorageConfig();
    return !!(
      cloudflare.accountId &&
      cloudflare.accessKeyId &&
      cloudflare.secretAccessKey &&
      cloudflare.bucketName &&
      cloudflare.publicDomain
    );
  }
}

// 创建单例
const configManager = new ClientConfigManager();

// 导出配置管理器
export default configManager; 