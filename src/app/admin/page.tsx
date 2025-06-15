import LoginForm from '@/components/LoginForm';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          FreeImages 管理
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          请登录以访问管理页面
        </p>
      </div>
      
      <LoginForm />
    </div>
  );
}