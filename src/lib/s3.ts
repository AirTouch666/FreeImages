import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3配置接口
export interface S3Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  uploadPath: string;
  publicDomain: string;
}

// 创建S3客户端
export const createS3Client = (config: S3Config) => {
  console.log('创建S3客户端:', {
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    hasCredentials: !!(config.accessKeyId && config.secretAccessKey)
  });
  
  try {
    // 确保使用正确的凭证格式
    return new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId.trim(),
        secretAccessKey: config.secretAccessKey.trim(),
      },
    });
  } catch (error) {
    console.error('创建S3客户端失败:', error);
    throw error;
  }
};

// 生成上传URL
export const generateUploadURL = async (
  config: S3Config,
  filename: string,
  contentType: string
): Promise<string> => {
  console.log('开始生成预签名URL:', {
    bucket: config.bucketName,
    key: `${config.uploadPath}${filename}`,
    contentType
  });
  
  try {
    // 验证配置
    if (!config.accountId) throw new Error('缺少accountId');
    if (!config.accessKeyId) throw new Error('缺少accessKeyId');
    if (!config.secretAccessKey) throw new Error('缺少secretAccessKey');
    if (!config.bucketName) throw new Error('缺少bucketName');
    
    // 创建客户端
    const client = createS3Client(config);
    
    // 生成唯一文件名和路径
    const key = `${config.uploadPath}${filename}`;
    
    // 创建上传命令
    const command = new PutObjectCommand({
      Bucket: config.bucketName.trim(),
      Key: key,
      ContentType: contentType,
    });

    try {
      // 生成预签名URL，有效期1小时
      const signedUrl = await getSignedUrl(client, command, { 
        expiresIn: 3600,
      });
      
      console.log('预签名URL生成成功:', signedUrl.substring(0, 50) + '...');
      return signedUrl;
    } catch (signedUrlError: any) {
      console.error('生成预签名URL失败:', signedUrlError);
      throw new Error(`生成预签名URL失败: ${signedUrlError.message || '未知错误'}`);
    }
  } catch (error: any) {
    console.error('S3操作失败:', error);
    throw new Error(`S3操作失败: ${error.message || '未知错误'}`);
  }
};

// 从URL中获取公共访问URL
export const getPublicUrl = (config: S3Config, key: string): string => {
  return `https://${config.publicDomain}/${key}`;
}; 