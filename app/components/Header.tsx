"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // 关闭移动菜单的函数
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  // 点击菜单外部时关闭下拉菜单
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (userMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
          setUserMenuOpen(false);
        }
      }
    };
    
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [userMenuOpen]);
  
  // 路由变化时关闭移动菜单
  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);
  
  // 导航链接
  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/prompts', label: '提示库' },
    { href: '/categories', label: '分类' },
    { href: '/about', label: '关于我们' },
  ];
  
  // 是否当前页面
  const isActivePage = (path: string) => {
    if (path === '/' && pathname !== '/') {
      return false;
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 backdrop-blur-md bg-opacity-90">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                提示精灵
              </span>
            </Link>
          </div>
          
          {/* 桌面导航 */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                  isActivePage(link.href) 
                    ? 'text-blue-400' 
                    : 'text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* 用户菜单或登录/注册按钮 */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative user-menu-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-300">
                    {user?.name || '用户'}
                  </span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                      个人中心
                    </Link>
                    
                    <Link href="/my-prompts" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                      我的提示词
                    </Link>
                    
                    {user?.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                        管理平台
                      </Link>
                    )}
                    
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link 
                  href="/login" 
                  className="py-2 px-3 text-sm font-medium text-gray-300 hover:text-white"
                >
                  登录
                </Link>
                <Link 
                  href="/register" 
                  className="py-2 px-4 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
                >
                  注册
                </Link>
              </div>
            )}
            
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <nav className="flex flex-col space-y-4 mt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-2 text-base font-medium transition-colors ${
                    isActivePage(link.href) 
                      ? 'text-blue-400' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {!isLoggedIn && (
                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-800">
                  <Link 
                    href="/login" 
                    className="py-2 text-base font-medium text-gray-300 hover:text-white"
                  >
                    登录
                  </Link>
                  <Link 
                    href="/register" 
                    className="py-2 px-4 text-base font-medium bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white inline-block text-center"
                  >
                    注册
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 