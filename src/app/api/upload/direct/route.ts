import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ServerConfigManager } from '@/config/server';
import { UploadResponse } from '@/types';

/**
 * 直接上传API
 * 服务器端直接处理文件上传到R2
 */
export async function POST(request: NextRequest) {
  try {
    // 解析multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: '未找到文件',
      } as UploadResponse, { status: 400 });
    }

    console.log('收到直接上传请求:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    try {
      // 获取配置
      const config = ServerConfigManager.getConfig();
      const { cloudflare } = config.storage;
      const uploadPath = config.storage.upload.path || 'uploads/';

      console.log('上传配置信息:', {
        accountId: cloudflare.accountId,
        bucketName: cloudflare.bucketName,
        uploadPath,
        publicDomain: cloudflare.publicDomain,
        hasAccessKey: !!cloudflare.accessKeyId,
        hasSecretKey: !!cloudflare.secretAccessKey
      });

      // 检查必要的配置
      if (!cloudflare.accountId || !cloudflare.accessKeyId || !cloudflare.secretAccessKey || 
          !cloudflare.bucketName || !cloudflare.publicDomain) {
        return NextResponse.json({
          success: false,
          error: '缺少必要的配置信息',
        } as UploadResponse, { status: 400 });
      }

      // 生成唯一文件名
      const fileExtension = file.name.split('.').pop() || '';
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      const fullPath = `${uploadPath}${uniqueFilename}`;
      
      console.log('生成文件路径:', fullPath);
      
      // 创建S3客户端
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${cloudflare.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: cloudflare.accessKeyId.trim(),
          secretAccessKey: cloudflare.secretAccessKey.trim(),
        },
      });

      // 将File对象转换为Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 创建上传命令
      const putCommand = new PutObjectCommand({
        Bucket: cloudflare.bucketName.trim(),
        Key: fullPath,
        Body: buffer,
        ContentType: file.type,
      });

      // 执行上传
      console.log('开始上传文件到R2...');
      await s3Client.send(putCommand);
      console.log('上传到R2成功');

      // 构建公共访问URL
      const publicUrl = `https://${cloudflare.publicDomain}/${fullPath}`;

      // 返回结果
      return NextResponse.json({
        success: true,
        publicUrl,
      });
    } catch (s3Error: any) {
      console.error('上传到R2失败:', s3Error);
      return NextResponse.json({
        success: false,
        error: `上传到R2失败: ${s3Error.message}`,
        details: s3Error.stack
      } as UploadResponse, { status: 500 });
    }
  } catch (error: any) {
    console.error('上传处理错误:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '上传过程中发生错误',
      details: error.stack
    } as UploadResponse, { status: 500 });
  }
} 