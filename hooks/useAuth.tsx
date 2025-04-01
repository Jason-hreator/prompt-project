"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar_url?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 提供者组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化 - 从本地存储中加载用户数据
  useEffect(() => {
    const initAuth = () => {
      try {
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('auth_token');
          const storedUser = localStorage.getItem('auth_user');
          
          if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('初始化认证状态时出错:', error);
        // 出错时清除可能损坏的数据
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 登录函数
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    
    // 保存到本地存储
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    
    // 发送登录状态改变事件
    window.dispatchEvent(new Event('auth-change'));
  };

  // 登出函数
  const logout = () => {
    setToken(null);
    setUser(null);
    
    // 清除本地存储
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // 发送登录状态改变事件
    window.dispatchEvent(new Event('auth-change'));
  };

  // 更新用户数据
  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  // 提供上下文值
  const contextValue: AuthContextType = {
    user,
    token,
    isLoggedIn: !!token,
    isLoading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义Hook，使组件能够访问上下文
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
} 