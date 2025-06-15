import { NextRequest, NextResponse } from 'next/server';
import { generateUploadURL } from '@/lib/s3';
import { Config, UploadResponse } from '@/types';

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

    // 从请求头获取配置信息
    const accountId = request.headers.get('x-account-id');
    const accessKeyId = request.headers.get('x-access-key-id');
    const secretAccessKey = request.headers.get('x-secret-access-key');
    const bucketName = request.headers.get('x-bucket-name');
    const uploadPath = request.headers.get('x-upload-path') || 'uploads/';

    // 检查必要的配置
    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json({
        success: false,
        error: '缺少必要的配置信息',
      } as UploadResponse, { status: 400 });
    }

    const config: Config = {
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      uploadPath,
    };

    // 生成唯一文件名
    const fileExtension = file.name.split('.').pop() || '';
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const fullPath = `${uploadPath}${uniqueFilename}`;
    
    // 生成预签名URL
    const signedUrl = await generateUploadURL(config, uniqueFilename, file.type);
    
    // 构建公共访问URL
    const publicUrl = `https://${bucketName}.r2.dev/${fullPath}`;

    // 返回预签名URL和公共URL给客户端
    return NextResponse.json({
      success: true,
      signedUrl,
      publicUrl,
      contentType: file.type,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '上传过程中发生错误',
    } as UploadResponse, { status: 500 });
  }
} 