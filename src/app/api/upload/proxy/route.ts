import { NextRequest, NextResponse } from 'next/server';

/**
 * 代理上传API
 * 当客户端直接上传到R2失败时，通过服务器中转上传
 */
export async function POST(request: NextRequest) {
  try {
    // 解析multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const signedUrl = formData.get('signedUrl') as string;
    const contentType = formData.get('contentType') as string;
    
    if (!file || !signedUrl) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数',
      }, { status: 400 });
    }

    console.log('服务器代理上传:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      contentType,
      signedUrlLength: signedUrl.length,
    });

    // 通过服务器上传到R2
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      console.log(`开始代理上传，URL长度: ${signedUrl.length}，URL前缀: ${signedUrl.substring(0, 50)}...`);
      
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: buffer,
        headers: {
          'Content-Type': contentType || file.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('服务器代理上传失败:', uploadResponse.status, errorText);
        return NextResponse.json({
          success: false,
          error: `上传失败: ${uploadResponse.status} ${uploadResponse.statusText}`,
          details: errorText
        }, { status: 500 });
      }

      console.log('服务器代理上传成功');
      return NextResponse.json({
        success: true,
      });
    } catch (fetchError: any) {
      console.error('代理上传请求失败:', fetchError);
      return NextResponse.json({
        success: false,
        error: `代理请求失败: ${fetchError.message}`,
        stack: fetchError.stack
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('服务器代理上传错误:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '上传过程中发生错误',
      stack: error.stack
    }, { status: 500 });
  }
} 