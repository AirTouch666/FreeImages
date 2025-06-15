'use client';

import ConfigForm from '@/components/ConfigForm';

export default function AdminPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          管理设置
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          配置您的Cloudflare R2存储信息
        </p>
      </div>

      <div className="w-full max-w-md">
        <ConfigForm />
      </div>

      <div className="mt-16 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">配置说明</h2>
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>
                <strong>Cloudflare 账户ID</strong>：您的Cloudflare账户ID，可以在Cloudflare R2控制台中找到。
              </li>
              <li>
                <strong>应用密钥ID</strong>：您的Cloudflare R2 Access Key ID。
              </li>
              <li>
                <strong>应用密钥</strong>：您的Cloudflare R2 Secret Access Key。
              </li>
              <li>
                <strong>桶名</strong>：您的R2存储桶名称。
              </li>
              <li>
                <strong>公共访问域名</strong>：R2存储桶的公共访问域名，通常格式为"pub-xxxxx.r2.dev"。您可以从R2控制台的"公共访问"设置中找到。
              </li>
              <li>
                <strong>文件路径</strong>：（可选）上传文件的存储路径前缀，默认为"uploads/"。
              </li>
            </ol>
            <div className="mt-4 p-4 bg-yellow-50 rounded-md">
              <p className="text-yellow-700">
                <strong>注意</strong>：所有配置信息都保存在本地浏览器中，不会上传到服务器。请确保您的R2存储桶已正确配置CORS策略。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}