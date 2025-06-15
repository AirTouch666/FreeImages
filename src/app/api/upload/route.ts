import { NextRequest, NextResponse } from 'next/server';
import { generateUploadURL } from '@/lib/s3';
import { UploadResponse } from '@/types';

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

    console.log('收到上传请求:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // 从请求头获取配置信息
    const accountId = request.headers.get('x-account-id');
    const accessKeyId = request.headers.get('x-access-key-id');
    const secretAccessKey = request.headers.get('x-secret-access-key');
    const bucketName = request.headers.get('x-bucket-name');
    const uploadPath = request.headers.get('x-upload-path') || 'uploads/';
    const publicDomain = request.headers.get('x-public-domain');

    console.log('上传配置信息:', {
      accountId,
      bucketName,
      uploadPath,
      publicDomain,
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey
    });

    // 检查必要的配置
    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicDomain) {
      return NextResponse.json({
        success: false,
        error: '缺少必要的配置信息',
        missing: {
          accountId: !accountId,
          accessKeyId: !accessKeyId,
          secretAccessKey: !secretAccessKey,
          bucketName: !bucketName,
          publicDomain: !publicDomain
        }
      } as UploadResponse, { status: 400 });
    }

    // 构建S3配置对象
    const s3Config = {
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      uploadPath,
      publicDomain,
    };

    // 生成唯一文件名
    const fileExtension = file.name.split('.').pop() || '';
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const fullPath = `${uploadPath}${uniqueFilename}`;
    
    console.log('生成文件路径:', fullPath);
    
    try {
      // 生成预签名URL
      const signedUrl = await generateUploadURL(s3Config, uniqueFilename, file.type);
      console.log('预签名URL生成成功');
      
      // 构建公共访问URL，使用publicDomain而不是桶名
      const publicUrl = `https://${publicDomain}/${fullPath}`;

      // 返回预签名URL和公共URL给客户端
      return NextResponse.json({
        success: true,
        signedUrl,
        publicUrl,
        contentType: file.type,
      });
    } catch (s3Error: any) {
      console.error('生成预签名URL失败:', s3Error);
      return NextResponse.json({
        success: false,
        error: `生成预签名URL失败: ${s3Error.message}`,
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