import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Config } from '@/types';

// 创建S3客户端
export const createS3Client = (config: Config) => {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accessKeyId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
};

// 生成上传URL
export const generateUploadURL = async (
  config: Config,
  filename: string,
  contentType: string
): Promise<string> => {
  const client = createS3Client(config);
  
  // 生成唯一文件名
  const key = `${config.uploadPath}${Date.now()}-${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    ContentType: contentType,
  });

  try {
    // 生成预签名URL
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

// 从URL中获取公共访问URL
export const getPublicUrl = (config: Config, key: string): string => {
  return `https://${config.bucketName}.r2.dev/${key}`;
}; 