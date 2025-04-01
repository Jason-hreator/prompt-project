"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // 前端验证
    if (!email) {
      setError('请输入您的邮箱地址');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '重置密码请求失败');
      }
      
      setSuccess('重置密码邮件已发送，请检查您的邮箱');
    } catch (err) {
      console.error('重置密码请求失败:', err);
      setError(err instanceof Error ? err.message : '发送重置密码邮件过程中出错，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-900">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">找回密码</h1>
          <p className="text-gray-400 mt-2">请输入您的邮箱地址，我们将发送密码重置链接</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
            {success}
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
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入您的邮箱"
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
          >
            {loading ? (
              <>
                <span className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                发送中...
              </>
            ) : (
              '发送重置链接'
            )}
          </button>
          
          <div className="text-center mt-4">
            <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm">
              返回登录
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 