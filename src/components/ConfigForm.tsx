'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getConfig, saveConfig } from '@/lib/config';
import { Config } from '@/types';

export default function ConfigForm() {
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Config>();

  // 加载保存的配置
  useEffect(() => {
    const config = getConfig();
    reset(config);
  }, [reset]);

  const onSubmit = async (data: Config) => {
    setIsSaving(true);
    
    try {
      // 保存配置到localStorage
      saveConfig(data);
      toast.success('配置已保存');
    } catch (error) {
      console.error('Save config error:', error);
      toast.error('保存配置失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cloudflare 账户ID
          </label>
          <input
            type="text"
            {...register('accountId', { required: true })}
            className="input"
            placeholder="输入您的Cloudflare账户ID"
          />
          {errors.accountId && (
            <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
          )}
          <p className="text-xs text-gray-500 mt-1">
            在Cloudflare R2控制台中可以找到
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            应用密钥ID (Access Key ID)
          </label>
          <input
            type="text"
            {...register('accessKeyId', { required: true })}
            className="input"
            placeholder="输入您的R2访问密钥ID"
          />
          {errors.accessKeyId && (
            <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            应用密钥 (Secret Access Key)
          </label>
          <input
            type="password"
            {...register('secretAccessKey', { required: true })}
            className="input"
            placeholder="输入您的R2访问密钥"
          />
          {errors.secretAccessKey && (
            <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            桶名 (Bucket Name)
          </label>
          <input
            type="text"
            {...register('bucketName', { required: true })}
            className="input"
            placeholder="输入您的R2存储桶名称"
          />
          {errors.bucketName && (
            <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            公共访问域名 (Public Domain)
          </label>
          <input
            type="text"
            {...register('publicDomain', { required: true })}
            className="input"
            placeholder="例如: pub-xxxxx.r2.dev"
          />
          {errors.publicDomain && (
            <span className="text-red-500 text-xs mt-1">此字段为必填项</span>
          )}
          <p className="text-xs text-gray-500 mt-1">
            R2存储桶的公共访问域名，通常格式为pub-xxxxx.r2.dev
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            文件路径 (Upload Path)
          </label>
          <input
            type="text"
            {...register('uploadPath')}
            className="input"
            placeholder="uploads/"
          />
          <p className="text-xs text-gray-500 mt-1">
            可选，默认为 "uploads/"，路径末尾需要有斜杠
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isSaving}
          className="btn btn-primary w-full"
        >
          {isSaving ? '保存中...' : '保存配置'}
        </button>
      </form>
    </div>
  );
} 