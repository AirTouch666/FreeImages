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
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
};

// 生成上传URL
export const generateUploadURL = async (
  config: S3Config,
  filename: string,
  contentType: string
): Promise<string> => {
  const client = createS3Client(config);
  
  // 生成唯一文件名
  const key = `${config.uploadPath}${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    ContentType: contentType,
  });

  try {
    // 生成预签名URL，有效期1小时
    const signedUrl = await getSignedUrl(client, command, { 
      expiresIn: 3600,
    });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

// 从URL中获取公共访问URL
export const getPublicUrl = (config: S3Config, key: string): string => {
  return `https://${config.publicDomain}/${key}`;
}; 