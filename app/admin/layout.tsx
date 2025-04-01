import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

// 侧边栏菜单项定义
const sidebarItems = [
  { 
    title: '仪表盘', 
    icon: 'dashboard', 
    path: '/admin',
    exact: true
  },
  { 
    title: '提示词管理', 
    icon: 'prompts', 
    path: '/admin/prompts',
  },
  { 
    title: '待审核提示词', 
    icon: 'review', 
    path: '/admin/review',
  },
  { 
    title: '分类管理', 
    icon: 'categories', 
    path: '/admin/categories',
  },
  { 
    title: '用户管理', 
    icon: 'users', 
    path: '/admin/users',
  },
  { 
    title: '精选提示词', 
    icon: 'star', 
    path: '/admin/featured',
  }
];

export default function AdminLayout({ children }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 检查用户是否有管理员权限
const isAdmin = user && (
  // 检查用户角色
  user.role === 'admin' ||
  // 从Supabase验证管理员身份
  user.email && (
    user.app_metadata?.admin === true || 
    user.user_metadata?.isAdmin === true
  )
);

  // 如果用户没有登录，显示未授权页面
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-6 rounded-lg bg-red-900/30 border border-red-700 text-center">
          <h1 className="text-2xl font-bold mb-4">需要登录</h1>
          <p className="text-red-200">您需要登录才能访问管理后台。</p>
          <Link href="/login" className="mt-4 btn-outline inline-flex items-center">
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  // 如果用户不是管理员，显示权限不足页面
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-6 rounded-lg bg-red-900/30 border border-red-700 text-center">
          <h1 className="text-2xl font-bold mb-4">权限不足</h1>
          <p className="text-red-200">您没有管理员权限，无法访问此页面。</p>
          <Link href="/" className="mt-4 btn-outline inline-flex items-center">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  // 管理员界面布局
  return (
    <div className="flex min-h-screen bg-gray-950">
      <AdminSidebar items={sidebarItems} currentPath={pathname} />
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}