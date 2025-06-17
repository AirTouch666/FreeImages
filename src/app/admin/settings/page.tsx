'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import AuthGuard from '@/components/AuthGuard';
import configManager from '@/config';

interface BasicSettings {
  title: string;
  description: string;
  theme: string;
  url: string;
  adminPassword: string;
  imageDomains: string;
}

export default function BasicSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BasicSettings>();

  // 加载保存的设置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        await configManager.init();
        const config = configManager.getConfig();
        const { site, security, images } = config.app;
        
        reset({
          title: site.title,
          description: site.description,
          theme: site.theme,
          url: site.url,
          adminPassword: security.adminPassword,
          imageDomains: images.domains.join(',')
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('加载配置失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, [reset]);

  const onSubmit = async (data: BasicSettings) => {
    setIsSaving(true);
    
    try {
      // 处理图片域名
      const imageDomains = data.imageDomains
        ? data.imageDomains.split(',').map(domain => domain.trim()).filter(Boolean)
        : [];
      
      // 更新配置
      await configManager.updateConfig({
        app: {
          site: {
            title: data.title,
            description: data.description,
            theme: data.theme,
            url: data.url
          },
          security: {
            adminPassword: data.adminPassword
          },
          images: {
            domains: imageDomains,
            formats: ['image/avif', 'image/webp']
          }
        }
      });
      
      toast.success('设置已保存，需要重启应用才能应用图片域名设置');
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('保存设置失败');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">配置管理</h2>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700"
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              刷新配置
            </button>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <nav className="flex -mb-px">
              <a href="/admin/settings" className="border-b-2 border-primary px-1 py-4 text-sm font-medium text-primary">
                基本设置
              </a>
              <a href="/admin/storage" className="border-b-2 border-transparent px-1 py-4 ml-8 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                存储设置
              </a>
              <a href="/admin/upload" className="border-b-2 border-transparent px-1 py-4 ml-8 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                上传设置
              </a>
            </nav>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> 应用名称
              </label>
              <input
                type="text"
                {...register('title', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="请输入应用名称"
              />
              {errors.title && (
                <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                应用描述
              </label>
              <input
                type="text"
                {...register('description')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="请输入应用描述"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> 应用URL
              </label>
              <input
                type="text"
                {...register('url', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="例如: https://example.com"
              />
              {errors.url && (
                <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                应用的完整URL，包括协议（http://或https://）
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                主题
              </label>
              <select
                {...register('theme')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="system">跟随系统</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                图片域名
              </label>
              <input
                type="text"
                {...register('imageDomains')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="例如: example.com,cdn.example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                允许通过Next.js图片组件加载的域名，多个域名用逗号分隔。R2域名会自动添加。
                <br />
                <span className="text-amber-600">注意: 修改此设置需要重启应用才能生效。</span>
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> 管理员密码
              </label>
              <input
                type="password"
                {...register('adminPassword', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="请输入管理员密码"
              />
              {errors.adminPassword && (
                <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700"
              >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm12 0v10H5V5h10z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {isSaving ? '保存中...' : '保存设置'}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
} 