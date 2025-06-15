import { NextRequest, NextResponse } from 'next/server';
import { getServerConfig, updateServerConfig } from '@/config/server';

/**
 * 获取配置
 */
export async function GET() {
  try {
    const config = getServerConfig();
    
    // 不返回敏感信息
    const safeConfig = {
      ...config,
      storage: {
        ...config.storage,
        cloudflare: {
          ...config.storage.cloudflare,
          // 不返回密钥
          secretAccessKey: config.storage.cloudflare.secretAccessKey ? '******' : '',
        }
      }
    };
    
    return NextResponse.json(safeConfig);
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json({ error: '获取配置失败' }, { status: 500 });
  }
}

/**
 * 更新配置
 */
export async function POST(request: NextRequest) {
  try {
    // 检查身份验证
    const auth = request.cookies.get('freeimages-auth');
    if (auth?.value !== 'true') {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const data = await request.json();
    const updatedConfig = updateServerConfig(data);
    
    // 不返回敏感信息
    const safeConfig = {
      ...updatedConfig,
      storage: {
        ...updatedConfig.storage,
        cloudflare: {
          ...updatedConfig.storage.cloudflare,
          // 不返回密钥
          secretAccessKey: updatedConfig.storage.cloudflare.secretAccessKey ? '******' : '',
        }
      }
    };
    
    return NextResponse.json(safeConfig);
  } catch (error) {
    console.error('更新配置失败:', error);
    return NextResponse.json({ error: '更新配置失败' }, { status: 500 });
  }
} 