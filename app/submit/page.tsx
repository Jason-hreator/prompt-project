"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isLoggedIn, getCurrentUser, getToken } from "../../lib/auth";

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("通用");
  const [model, setModel] = useState("GPT-4");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // 分类列表
  const categories = ['通用', '创意写作', '内容总结', '代码开发', '学术研究', '数据分析', '其他'];
  
  // AI模型列表
  const models = ['通用', 'GPT-4', 'GPT-3.5', 'Claude', 'Gemini', 'Llama'];

  // 检查登录状态
  useEffect(() => {
    const checkLoginStatus = async () => {
      setLoading(true);
      const loggedIn = isLoggedIn();
      setIsUserLoggedIn(loggedIn);
      
      if (loggedIn) {
        const currentUser = getCurrentUser();
        // 确保user是一个安全的对象，可以用于渲染
        if (currentUser) {
          setUser({
            id: currentUser.id,
            name: typeof currentUser.name === 'object' ? 
              (currentUser.name.name || 'Unknown') : currentUser.name,
            username: currentUser.username,
            email: currentUser.email,
            role: currentUser.role
          });
        }
      }
      
      setLoading(false);
    };
    
    checkLoginStatus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isUserLoggedIn) {
      setError('必须登录才能提交提示词');
      return;
    }
    
    if (!title || !content) {
      setError('标题和内容为必填项');
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      const token = getToken();
      const response = await fetch('/api/prompts/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          description,
          category,
          model
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTitle("");
        setContent("");
        setDescription("");
        setCategory("通用");
        setModel("GPT-4");
        
        // 自动跳转到提示词详情页或个人主页
        setTimeout(() => {
          router.push('/user/profile'); // 跳转到个人主页
        }, 2000);
      } else {
        setError(data.error || '提交失败，请重试');
      }
    } catch (err) {
      setError('提交过程中发生错误');
      console.error('提交提示词出错:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-white">加载中...</span>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg mt-10 text-white">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-400">提交成功！</h2>
        <p className="text-center mb-6">
          您的提示词已成功提交，正在等待审核。审核通过后将在网站上公开显示。
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/user/profile" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            查看我的提交
          </Link>
          <Link href="/" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg mt-10 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">提交新的提示词</h1>
      
      {!isUserLoggedIn ? (
        <div className="bg-yellow-800 text-white p-4 rounded-lg mb-6">
          <p className="mb-2">您需要登录才能提交提示词。</p>
          <div className="flex space-x-4">
            <Link href="/login?redirect=/submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              登录
            </Link>
            <Link href="/register" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
              注册
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-800 text-white p-4 rounded-lg">
              <p>{error}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="提示词的标题"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">提示词内容 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
              placeholder="在这里输入提示词内容..."
              required
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">描述（可选）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
              placeholder="描述这个提示词的用途、背景或使用方法..."
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">适用模型</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">* 表示必填字段</p>
            <div className="flex space-x-4">
              <Link href="/" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                取消
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? '提交中...' : '提交'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
} 