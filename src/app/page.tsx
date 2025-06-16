import UploadForm from '@/components/UploadForm';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          FreeImages 图床
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          简单、快速、免费的图片托管服务，基于Cloudflare R2存储
        </p>
      </div>

      <div className="w-full max-w-3xl">
        <UploadForm />
      </div>

      <div className="mt-16 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">使用说明</h2>
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>
                点击上传区域或将图片拖拽到上传区域。
              </li>
              <li>
                点击"上传图片"按钮，等待上传完成。
              </li>
              <li>
                上传成功后，您将获得图片的链接，可以复制并分享给他人。
              </li>
              <li>
                如需配置您自己的存储设置，请访问
                <a href="/admin" className="text-primary hover:underline">
                  {' '}管理页面
                </a>
                。
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 