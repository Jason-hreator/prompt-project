"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// 提示词类型定义
interface Prompt {
  id: number;
  title: string;
  content: string;
  description: string;
  model?: string;
  category?: {
    name: string;
  };
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
  created_at: string;
  views?: number;
  likes?: number;
}

export default function PromptDetailPage() {
  const params = useParams();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const fetchPromptDetail = async () => {
      try {
        setLoading(true);
        
        if (!params.id) {
          throw new Error("提示词ID不存在");
        }
        
        const response = await fetch(`/api/prompts/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`请求失败: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setPrompt(data.data);
        } else {
          setError(data.error || "获取提示词详情失败");
        }
      } catch (err) {
        console.error("获取提示词详情失败:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("获取提示词详情时发生未知错误");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPromptDetail();
  }, [params.id]);
  
  const handleCopyContent = () => {
    if (!prompt) return;
    
    navigator.clipboard.writeText(prompt.content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("复制失败:", err);
      });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card p-6 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-4/5 mb-8"></div>
          <div className="h-32 bg-gray-700 rounded w-full mb-6"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-6 rounded-lg bg-red-900/30 border border-red-700 text-center">
          <p className="text-red-200">{error}</p>
          <Link href="/prompts" className="mt-4 btn-outline inline-flex items-center">
            返回提示词列表
          </Link>
        </div>
      </div>
    );
  }
  
  if (!prompt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 text-center">
          <p className="text-gray-400">提示词不存在或已被删除</p>
          <Link href="/prompts" className="mt-4 btn-outline inline-flex items-center">
            返回提示词列表
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 导航链接 */}
        <div className="mb-6">
          <Link href="/prompts" className="text-blue-400 hover:text-blue-300 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回提示词列表
          </Link>
        </div>
        
        {/* 标题和元信息 */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{prompt.title}</h1>
          
          <div className="flex flex-wrap items-center text-sm text-gray-400 gap-4">
            {prompt.category && (
              <span className="badge badge-blue">{prompt.category.name}</span>
            )}
            
            {prompt.model && (
              <span className="badge badge-purple">{prompt.model}</span>
            )}
            
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(prompt.created_at).toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
              })}
            </span>
            
            {prompt.views !== undefined && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {prompt.views} 次查看
              </span>
            )}
            
            {prompt.likes !== undefined && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {prompt.likes} 次点赞
              </span>
            )}
          </div>
        </div>
        
        {/* 作者信息 */}
        {prompt.user && (
          <div className="mb-8 flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden mr-3">
              {prompt.user.avatar ? (
                <img 
                  src={prompt.user.avatar} 
                  alt={prompt.user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-lg font-medium">
                  {prompt.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium">{prompt.user.name}</div>
              <Link href={`/user/${prompt.user.id}`} className="text-sm text-blue-400 hover:text-blue-300">
                查看作者主页
              </Link>
            </div>
          </div>
        )}
        
        {/* 提示词描述 */}
        {prompt.description && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">描述</h2>
            <p className="text-gray-300">{prompt.description}</p>
          </div>
        )}
        
        {/* 提示词内容 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">提示词内容</h2>
            <button
              onClick={handleCopyContent}
              className="btn-outline flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {copied ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                )}
              </svg>
              {copied ? "已复制" : "复制"}
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 font-mono text-sm whitespace-pre-wrap">
            {prompt.content}
          </div>
        </div>
        
        {/* 相关操作 */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2">
            <button className="btn-primary flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              点赞
            </button>
            
            <button className="btn-outline flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              分享
            </button>
          </div>
          
          <Link href="/submit" className="btn-secondary flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            提交新提示词
          </Link>
        </div>
      </div>
    </div>
  );
}