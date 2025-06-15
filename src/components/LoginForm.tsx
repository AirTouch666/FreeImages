'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import configManager from '@/config';

export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 初始化配置管理器
    configManager.init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 获取配置中的管理员密码
      const config = configManager.getConfig();
      const adminPassword = config.app.security.adminPassword;

      // 验证密码
      if (password === adminPassword) {
        // 设置登录状态（同时在localStorage和cookie中设置）
        localStorage.setItem('freeimages-auth', 'true');
        
        // 设置cookie，有效期24小时
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000);
        document.cookie = `freeimages-auth=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
        
        // 跳转到管理页面
        router.push('/admin/settings');
      } else {
        setError('密码错误');
      }
    } catch (error) {
      console.error('登录失败:', error);
      setError('登录过程中发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          管理员登录
        </h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="请输入管理密码"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              默认密码为: admin
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
} 