'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import AuthGuard from '@/components/AuthGuard';
import configManager from '@/config';

interface UploadSettings {
  path: string;
  maxSize: number;
  allowedTypes: string;
}

export default function UploadSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UploadSettings>();

  // 加载保存的设置
  useEffect(() => {
    try {
      const config = configManager.getConfig();
      const { upload } = config.storage;
      
      // 将数组类型转换为字符串
      const allowedTypesString = upload.allowedTypes
        .map(type => type.replace('image/', ''))
        .join(',');
      
      reset({
        path: upload.path,
        maxSize: upload.maxSize,
        allowedTypes: allowedTypesString
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, [reset]);

  const onSubmit = async (data: UploadSettings) => {
    setIsSaving(true);
    
    try {
      // 将字符串类型转换为数组
      const allowedTypesArray = data.allowedTypes
        .split(',')
        .map(type => type.trim())
        .filter(Boolean)
        .map(type => `image/${type}`);
      
      // 更新配置
      configManager.updateConfig({
        storage: {
          upload: {
            path: data.path,
            maxSize: data.maxSize,
            allowedTypes: allowedTypesArray
          }
        }
      });
      
      toast.success('设置已保存');
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('保存设置失败');
    } finally {
      setIsSaving(false);
    }
  };

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
              <a href="/admin/storage" className="border-b-2 border-transparent px-1 py-4 ml-8 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                存储设置
              </a>
              <a href="/admin/upload" className="border-b-2 border-primary px-1 py-4 ml-8 text-sm font-medium text-primary">
                上传设置
              </a>
            </nav>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> 文件路径
              </label>
              <input
                type="text"
                {...register('path', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="例如: uploads/"
              />
              {errors.path && (
                <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                路径末尾需要有斜杠
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> 最大文件大小(MB)
              </label>
              <input
                type="number"
                {...register('maxSize', { required: true, min: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="10"
              />
              {errors.maxSize && (
                <span className="text-red-500 text-xs mt-1">请输入有效的文件大小</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> 允许的文件类型
              </label>
              <input
                type="text"
                {...register('allowedTypes', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="jpg,jpeg,png,gif,webp"
              />
              {errors.allowedTypes && (
                <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                文件类型用逗号分隔，不包含点号
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