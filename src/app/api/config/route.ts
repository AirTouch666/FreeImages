import { NextRequest, NextResponse } from 'next/server';
import { getServerConfig, updateServerConfig } from '@/config/server';
import fs from 'fs';
import path from 'path';

// 配置文件路径
const CONFIG_FILE_PATH = path.join(process.cwd(), 'freeimages.config.json');

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
    // 检查身份验证 - 同时支持cookie和localStorage
    const auth = request.cookies.get('freeimages-auth');
    if (auth?.value !== 'true') {
      console.log('未授权访问，缺少有效的认证cookie');
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 检查配置文件目录是否可写
    const dirPath = path.dirname(CONFIG_FILE_PATH);
    try {
      // 确保目录存在
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // 检查写入权限
      fs.accessSync(dirPath, fs.constants.W_OK);
    } catch (fsError) {
      console.error('配置文件目录权限错误:', fsError);
      return NextResponse.json({ 
        error: '配置文件目录权限错误，请确保应用有权限写入配置文件',
        details: fsError instanceof Error ? fsError.message : String(fsError)
      }, { status: 500 });
    }

    // 解析请求数据
    const data = await request.json();
    console.log('收到更新配置请求:', JSON.stringify(data));
    
    // 更新配置
    const updatedConfig = updateServerConfig(data);
    console.log('配置已更新');
    
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
    return NextResponse.json({ 
      error: '更新配置失败', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 