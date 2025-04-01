"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isLoggedIn, getToken } from "../../../lib/auth";

interface Prompt {
  id: number;
  title: string;
  content: string;
  description: string;
  category: string;
  model: string;
  author: string;
  status: string;
  date: string;
  likes: number;
}

export default function UserLikesPage() {
  const router = useRouter();
  const [likedPrompts, setLikedPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login?redirect=/user/likes');
      return;
    }
    
    setUser(getCurrentUser());
    fetchLikedPrompts().then(() => {
      setLoading(false);
    }).catch(err => {
      setError('加载数据失败');
      setLoading(false);
      console.error('加载用户数据错误:', err);
    });
  }, [router]);

  const fetchLikedPrompts = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) return;
      
      const token = getToken();
      
      const response = await fetch(`/api/user/likes?userId=${currentUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLikedPrompts(data.prompts || []);
      } else {
        console.error('获取点赞的提示词失败:', data.error);
      }
    } catch (err) {
      console.error('获取点赞的提示词错误:', err);
    }
  };

  const getModelColor = (model: string): string => {
    const modelColors: {[key: string]: string} = {
      'GPT-4': 'bg-green-900 text-green-100',
      'GPT-3.5': 'bg-blue-900 text-blue-100',
      'Claude': 'bg-purple-900 text-purple-100',
      'Gemini': 'bg-indigo-900 text-indigo-100',
      'Llama': 'bg-red-900 text-red-100',
      '通用': 'bg-gray-700 text-gray-100'
    };
    
    return modelColors[model] || 'bg-gray-700 text-gray-100';
  };

  if (loading && !user) {
    return (
      <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">我的点赞</h1>
        <p className="text-gray-400">您点赞的提示词列表</p>
      </div>
      
      {error && (
        <div className="bg-red-800 text-white p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {likedPrompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {likedPrompts.map(prompt => (
            <div key={prompt.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/prompts/${prompt.id}`} className="text-xl font-semibold hover:text-blue-400 transition-colors">
                    {prompt.title}
                  </Link>
                  <span className={`px-2 py-1 rounded-full text-xs ${getModelColor(prompt.model)}`}>
                    {prompt.model}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {prompt.description || prompt.content}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>作者: {prompt.author}</span>
                  <span>❤️ {prompt.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-800 rounded-lg">
          <h3 className="text-xl mb-2">暂无点赞的提示词</h3>
          <p className="text-gray-400 mb-4">浏览提示词库并点击点赞按钮添加到您的点赞列表</p>
          <Link href="/prompts" className="inline-block bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            浏览提示词库
          </Link>
        </div>
      )}
    </div>
  );
} 