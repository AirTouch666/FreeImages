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
        }
      } catch (error) {
        console.error('加载配置失败:', error);
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
      // 发送到API
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });

      if (response.ok) {
        // 更新本地配置
        const updatedConfig = await response.json();
        this.config = updatedConfig;
      } else {
        throw new Error('更新配置失败');
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
    return this.updateConfig({ storage: storageConfig });
  }

  /**
   * 更新应用配置
   */
  public updateAppConfig(appConfig: Partial<ConfigType['app']>): Promise<void> {
    return this.updateConfig({ app: appConfig });
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