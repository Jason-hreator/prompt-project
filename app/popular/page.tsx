"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PromptCard from '../components/PromptCard';

export default function PopularPromptsPage() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchPopularPrompts = async () => {
      setLoading(true);
      try {
        // 获取热门提示词，按点赞数排序
        const response = await fetch('/api/prompts?sort=popular&limit=20');
        const data = await response.json();
        
        if (data.success) {
          setPrompts(data.data);
        } else {
          setError(data.error || "获取热门提示词失败");
        }
      } catch (err) {
        console.error("获取热门提示词失败:", err);
        setError("获取热门提示词时发生错误");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPopularPrompts();
  }, []);
  
  // 获取模型对应的颜色
  const getModelColor = (model) => {
    const modelColors = {
      'ChatGPT': 'bg-green-100 text-green-800',
      'Midjourney': 'bg-blue-100 text-blue-800',
      'DALL-E': 'bg-purple-100 text-purple-800',
      'Stable Diffusion': 'bg-orange-100 text-orange-800',
      'Claude': 'bg-indigo-100 text-indigo-800',
    };
    
    return modelColors[model] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2 text-center">热门排行</h1>
      <p className="text-center text-gray-600 mb-8">根据用户喜欢数量排序的最受欢迎提示词</p>
      
      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      )}
      
      {/* 错误消息 */}
      {error && !loading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* 提示词列表 */}
      {!loading && !error && prompts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-600">暂无热门提示词</p>
        </div>
      )}
      
      {!loading && !error && prompts.length > 0 && (
        <div className="space-y-8">
          {/* 热门TOP3 */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b">TOP 3 热门提示词</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {prompts.slice(0, 3).map((prompt, index) => (
                <Link href={`/prompts/${prompt.id}`} key={prompt.id}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 h-full transform hover:scale-105 transition-transform duration-200">
                    <div className="relative">
                      <div className="absolute top-0 left-0 bg-yellow-500 text-white font-bold px-4 py-2 rounded-br-lg">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2">{prompt.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{prompt.description || ''}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs ${getModelColor(prompt.model)}`}>
                          {prompt.model}
                        </span>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span className="text-gray-700">{prompt.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* 其他热门提示词 */}
          <h2 className="text-xl font-semibold mb-6 pb-2 border-b">更多热门提示词</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.slice(3).map((prompt) => (
              <PromptCard
                key={prompt.id}
                id={prompt.id}
                title={prompt.title}
                description={prompt.description || ''}
                model={prompt.model}
                modelColor={getModelColor(prompt.model)}
                likes={prompt.likes || 0}
                comments={prompt.comments?.length || 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 