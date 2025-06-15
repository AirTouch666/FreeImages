'use client';

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import configManager from '@/config';
import { UploadResponse } from '@/types';

export default function UploadForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // 初始化配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        await configManager.init();
        setIsConfigLoaded(true);
        console.log('配置已加载');
      } catch (error) {
        console.error('加载配置失败:', error);
        toast.error('加载配置失败，请刷新页面重试');
      }
    };
    
    loadConfig();
  }, []);

  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      await uploadFiles(fileArray);
    }
  };

  // 处理拖拽事件
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropAreaRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // 过滤出图片文件
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (imageFiles.length === 0) {
        toast.error('请上传图片文件');
        return;
      }
      
      await uploadFiles(imageFiles);
    }
  };

  // 处理点击上传区域
  const handleAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 上传文件
  const uploadFiles = async (files: File[]) => {
    if (!isConfigLoaded) {
      toast.error('配置尚未加载完成，请稍后再试');
      return;
    }

    if (files.length === 0) {
      toast.error('请选择一个文件');
      return;
    }

    // 检查配置是否完整
    if (!configManager.isConfigComplete()) {
      toast.error('请先在管理页面配置存储设置');
      return;
    }

    setIsUploading(true);
    setUploadedUrl(null);

    try {
      // 只上传第一个文件（可以扩展为多文件上传）
      const file = files[0];
      
      // 创建FormData对象，直接上传文件到服务器
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('开始直接上传文件:', file.name, '类型:', file.type, '大小:', file.size);
      
      // 发送直接上传请求到服务器端点
      const response = await fetch('/api/upload/direct', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`上传失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '上传失败');
      }

      // 上传成功
      setUploadedUrl(result.publicUrl);
      toast.success('上传成功!');
      
      // 自动复制链接到剪贴板
      navigator.clipboard.writeText(result.publicUrl)
        .then(() => toast.success('链接已复制到剪贴板'))
        .catch(() => toast.error('复制链接失败，请手动复制'));
      
      // 重置文件输入
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
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div 
        ref={dropAreaRef}
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          ${isDragging ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleAreaClick}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-lg font-medium text-gray-700">上传中...</p>
          </div>
        ) : (
          <>
            <div className="text-primary mb-4">
              <svg className="w-16 h-16 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h10a4 4 0 004-4v-5a4 4 0 00-4-4h-3l-1-2H7a4 4 0 00-4 4v7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11v5m4-5v5m4-5v5" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-700">点击或拖拽图片到此区域上传</p>
            <p className="text-sm text-gray-500 mt-2">支持单个或批量上传，严禁上传规则图片</p>
          </>
        )}
        
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          disabled={isUploading}
        />
      </div>

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