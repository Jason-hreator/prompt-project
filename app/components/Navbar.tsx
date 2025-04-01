"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // 内联定义身份验证逻辑
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadUser = () => {
      try {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('解析用户数据失败:', e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    // 每次路径变化时重新加载用户信息
    loadUser();
    
    // 监听身份验证变化
    const handleAuthChange = () => loadUser();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [pathname]); // 添加pathname作为依赖项，确保路径变化时重新检查登录状态
  
  // 登出功能
  const logout = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    setUser(null);
    setUserMenuOpen(false);
    router.push('/');
    window.dispatchEvent(new Event('auth-change'));
  };

  // 关闭用户菜单的处理函数
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (userMenuOpen && !target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    
    // 添加全局点击事件监听器
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [userMenuOpen]);

  const displayName = user?.name || user?.username || user?.email || 'U';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white font-bold text-xl">
              提示词分享
            </Link>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/prompts" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  浏览提示词
                </Link>
                <Link href="/categories" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  分类
                </Link>
                <Link href="/submit" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  提交提示词
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!loading && user ? (
              <div className="relative user-menu-container">
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userInitial}
                    </span>
                  </div>
                  <span className="text-gray-300">{displayName}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-gray-700 ring-opacity-5 z-50" 
                       onClick={(e) => e.stopPropagation()}>
                    <div className="py-1">
                      {user.role === 'admin' && (
                        <>
                          <Link href="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                            管理后台
                          </Link>
                          <hr className="my-1 border-gray-700" />
                        </>
                      )}
                      <Link href="/user/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                        个人资料
                      </Link>
                      <Link href="/user/prompts" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                        我的提示词
                      </Link>
                      <Link href="/user/likes" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                        我的点赞
                      </Link>
                      <hr className="my-1 border-gray-700" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止事件冒泡
                          logout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        退出登录
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  登录
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  注册
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/prompts" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              浏览提示词
            </Link>
            <Link href="/categories" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              分类
            </Link>
            <Link href="/submit" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              提交提示词
            </Link>
          </div>
          {!loading && user ? (
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userInitial}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{displayName}</div>
                  {user.email && <div className="text-sm font-medium text-gray-400">{user.email}</div>}
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                {user.role === 'admin' && (
                  <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                    管理后台
                  </Link>
                )}
                <Link href="/user/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                  个人资料
                </Link>
                <Link href="/user/prompts" className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                  我的提示词
                </Link>
                <Link href="/user/likes" className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                  我的点赞
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  退出登录
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="px-2 space-y-1">
                <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                  登录
                </Link>
                <Link href="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                  注册
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
} 