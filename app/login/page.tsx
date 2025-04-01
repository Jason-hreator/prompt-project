"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 前端验证
    if (!email || !password) {
      setError('请填写所有必填字段');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }
      
      if (data.token && data.user) {
        // 保存用户信息和token
        login(data.token, data.user);
        
        // 跳转到首页或者用户之前访问的页面
        router.push('/');
      } else {
        throw new Error('登录响应缺少必要信息');
      }
    } catch (err) {
      console.error('登录失败:', err);
      setError(err instanceof Error ? err.message : '登录过程中出错，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-900">
      <div className="card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">登录账号</h1>
          <p className="text-gray-400 mt-2">欢迎回到提示精灵，请登录您的账号</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              邮箱 <span className="text-red-400">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入您的邮箱"
              required
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                密码 <span className="text-red-400">*</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                忘记密码?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入您的密码"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center"
          >
            {loading ? (
              <>
                <span className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                登录中...
              </>
            ) : (
              '登录'
            )}
          </button>
          
          <div className="text-center">
            <p className="text-gray-400">
              还没有账号？
              <Link href="/register" className="text-blue-400 hover:text-blue-300 ml-1">
                立即注册
              </Link>
            </p>
          </div>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="text-center text-sm text-gray-400">
            <p>测试账号：</p>
            <p className="mt-1">管理员: admin@example.com / password</p>
            <p className="mt-1">普通用户: user@example.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
} 