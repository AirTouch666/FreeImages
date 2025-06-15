'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary">
                FreeImages
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {isAdmin ? (
              <Link href="/" className="btn btn-secondary">
                返回首页
              </Link>
            ) : (
              <Link href="/admin" className="btn btn-primary">
                管理页面
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 