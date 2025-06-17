'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import AuthGuard from '@/components/AuthGuard';
import configManager from '@/config';

interface StorageFormData {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string;
  uploadPath: string;
}

export default function StorageSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<StorageFormData>();

  // 加载保存的配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        await configManager.init();
        const config = configManager.getConfig();
        const { cloudflare } = config.storage;
        
        // 准备表单数据
        const formData = {
          accountId: cloudflare.accountId,
          accessKeyId: cloudflare.accessKeyId,
          secretAccessKey: cloudflare.secretAccessKey,
          bucketName: cloudflare.bucketName,
          publicDomain: cloudflare.publicDomain,
          uploadPath: config.storage.upload.path,
        };
        
        reset(formData);
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('加载配置失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, [reset]);

  const onSubmit = async (data: StorageFormData) => {
    setIsSaving(true);
    
    try {
      // 提取上传路径
      const { uploadPath, ...cloudflareData } = data;
      
      // 更新配置
      await configManager.updateConfig({
        storage: {
          cloudflare: cloudflareData,
          upload: {
            path: uploadPath,
            maxSize: 10, // 默认最大上传大小10MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], // 默认允许的图片类型
          }
        }
      });
      
      toast.success('配置已保存，需要重启应用才能应用域名设置');
    } catch (error) {
      console.error('Save config error:', error);
      toast.error('保存配置失败');
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
              <a href="/admin/settings" className="border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                基本设置
              </a>
              <a href="/admin/storage" className="border-b-2 border-primary px-1 py-4 ml-8 text-sm font-medium text-primary">
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
                <span className="text-red-500">*</span> 应用密钥ID
              </label>
              <input
                type="text"
                {...register('accessKeyId', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="请输入Cloudflare R2的访问密钥ID"
              />
              {errors.accessKeyId && (
                <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> 应用密钥
              </label>
              <input
                type="password"
                {...register('secretAccessKey', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="请输入Cloudflare R2的访问密钥"
              />
              {errors.secretAccessKey && (
                <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> 存储桶名称
              </label>
              <input
                type="text"
                {...register('bucketName', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="请输入R2存储桶名称"
              />
              {errors.bucketName && (
                <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Cloudflare账户ID
              </label>
              <input
                type="text"
                {...register('accountId', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="请输入Cloudflare账户ID"
              />
              {errors.accountId && (
                <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> 公共访问域名
              </label>
              <input
                type="text"
                {...register('publicDomain', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="例如: pub-xxxxx.r2.dev 或 cdn.example.com"
              />
              {errors.publicDomain && (
                <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                可以是R2默认公共域名（如 pub-xxxxx.r2.dev）或您自己的自定义域名（如 cdn.example.com）
                <br />
                <span className="text-amber-600">注意: 修改此设置需要重启应用才能生效。</span>
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                上传路径
              </label>
              <input
                type="text"
                {...register('uploadPath')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="uploads/"
              />
              <p className="text-xs text-gray-500 mt-1">
                可选，默认为 "uploads/"，路径末尾需要有斜杠
              </p>
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