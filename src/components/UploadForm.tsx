'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { getConfig, isConfigComplete } from '@/lib/config';
import { UploadResponse } from '@/types';

export default function UploadForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('请选择一个文件');
      return;
    }

    const config = getConfig();
    if (!isConfigComplete(config)) {
      toast.error('请先在管理页面配置存储设置');
      return;
    }

    setIsUploading(true);
    setUploadedUrl(null);

    try {
      // 第一步：获取预签名URL
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'x-account-id': config.accountId,
          'x-access-key-id': config.accessKeyId,
          'x-secret-access-key': config.secretAccessKey,
          'x-bucket-name': config.bucketName,
          'x-upload-path': config.uploadPath || 'uploads/',
          'x-public-domain': config.publicDomain,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '获取上传URL失败');
      }

      console.log('获取预签名URL成功:', result.signedUrl);

      // 第二步：使用预签名URL直接上传到R2
      const uploadResponse = await fetch(result.signedUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': result.contentType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`上传失败: ${uploadResponse.statusText}`);
      }

      console.log('上传到R2成功');

      // 上传成功
      setUploadedUrl(result.publicUrl);
      toast.success('上传成功!');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || '上传过程中发生错误');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            选择图片
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-blue-600"
          />
          {selectedFile && (
            <p className="text-sm text-green-600 mt-1">
              已选择: {selectedFile.name}
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isUploading}
          className="btn btn-primary w-full"
        >
          {isUploading ? '上传中...' : '上传图片'}
        </button>
      </form>

      {uploadedUrl && (
        <div className="mt-6 p-4 border rounded-md">
          <h3 className="font-medium text-gray-900">上传成功!</h3>
          <div className="mt-2 overflow-hidden">
            <p className="text-sm text-gray-500 break-all">{uploadedUrl}</p>
            <div className="mt-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(uploadedUrl);
                  toast.success('已复制到剪贴板');
                }}
                className="btn btn-secondary text-sm"
              >
                复制链接
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 