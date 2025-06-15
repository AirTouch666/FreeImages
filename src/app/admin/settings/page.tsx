'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import AuthGuard from '@/components/AuthGuard';

interface BasicSettings {
  appName: string;
  domain: string;
}

export default function BasicSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BasicSettings>();

  // 加载保存的设置
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('freeimages-basic-settings');
      if (savedSettings) {
        reset(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, [reset]);

  const onSubmit = async (data: BasicSettings) => {
    setIsSaving(true);
    
    try {
      // 保存设置到localStorage
      localStorage.setItem('freeimages-basic-settings', JSON.stringify(data));
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
                {...register('appName', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="请输入应用名称"
              />
              {errors.appName && (
                <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> 域名
              </label>
              <input
                type="text"
                {...register('domain', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="请输入域名，例如：https://example.com"
              />
              {errors.domain && (
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