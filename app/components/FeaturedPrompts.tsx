"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface Prompt {
  id: number;
  title: string;
  description: string;
  model?: string;
  user?: {
    name: string;
  };
  created_at: string;
  views?: number;
  likes?: number;
  category?: {
    name: string;
  };
}

export default function FeaturedPrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchFeaturedPrompts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 使用API端点获取特色提示词，而不是直接使用supabase
        const response = await fetch('/api/prompts?featured=true');
        
        if (!response.ok) {
          throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || '获取特色提示词失败');
        }
        
        if (Array.isArray(result.data)) {
          setPrompts(result.data);
        } else {
          console.warn('API返回的数据格式不正确:', result);
          setPrompts([]);
        }
      } catch (err) {
        console.error('获取特色提示词时出错:', err);
        if (err instanceof Error) {
          setError(`获取提示词失败: ${err.message}`);
        } else {
          setError('获取提示词失败，请稍后重试');
        }
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPrompts();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
            <div className="flex justify-between items-center mt-4">
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-red-900/30 border border-red-700 text-center">
        <p className="text-red-200">{error}</p>
        <button 
          onClick={handleRetry}
          className="mt-4 btn-outline inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          重新加载
        </button>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 text-center">
        <p className="text-gray-400">暂无特色提示词</p>
        <p className="text-gray-500 text-sm mt-2">请稍后查看或尝试添加您自己的提示词</p>
        <div className="mt-4">
          <Link href="/submit" className="btn-primary text-sm">
            提交提示词
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prompts.map((prompt) => (
        <Link 
          href={`/prompts/${prompt.id}`} 
          key={prompt.id}
          className="card hover:border-blue-600/50 transition-colors group"
        >
          <div className="p-6">
            {prompt.category && (
              <div className="badge badge-blue mb-3">
                {prompt.category.name}
              </div>
            )}
            
            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
              {prompt.title}
            </h3>
            
            <p className="text-gray-400 text-sm line-clamp-2 mb-4">
              {prompt.description}
            </p>
            
            <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-700 pt-4 mt-auto">
              <div className="flex items-center">
                {prompt.model && (
                  <span className="mr-4">{prompt.model}</span>
                )}
                <span>
                  {new Date(prompt.created_at).toLocaleDateString('zh-CN', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {prompt.views !== undefined && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {prompt.views}
                  </span>
                )}
                
                {prompt.likes !== undefined && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {prompt.likes}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}