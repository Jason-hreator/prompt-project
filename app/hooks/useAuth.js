'use client';

import { useState, useEffect } from 'react';

// useAuth hook 实现
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
        setLoading(false);
      } catch (error) {
        console.error('加载用户信息失败:', error);
        setLoading(false);
      }
    };

    // 初始加载
    loadUser();

    // 监听存储变化
    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  // 登出功能
  const logout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      // 触发事件通知其他组件
      window.dispatchEvent(new Event('auth-change'));
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  return {
    user,
    loading,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    logout
  };
} 