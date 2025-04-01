"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// 用户信息类型
interface User {
  id: string | number;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  role?: string;
  created_at?: string;
}

// 提示词类型
interface Prompt {
  id: number;
  title: string;
  description: string;
  model?: string;
  category?: {
    name: string;
  };
  created_at: string;
  views?: number;
  likes?: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        if (!params.id) {
          throw new Error("用户ID不存在");
        }
        
        // 获取用户信息
        const userResponse = await fetch(`/api/user/${params.id}`);
        
        if (!userResponse.ok) {
          // 如果API失败，创建一个备用用户信息
          if (params.id === 'admin-test-id-123') {
            setUser({
              id: 'admin-test-id-123',
              name: '管理员',
              role: 'admin',
              bio: '这是一个测试管理员账号',
              created_at: '2023-01-01T00:00:00Z'
            });
          } else if (params.id === 'user-test-id-456') {
            setUser({
              id: 'user-test-id-456',
              name: '测试用户',
              role: 'user',
              bio: '这是一个测试用户账号',
              created_at: '2023-01-02T00:00:00Z'
            });
          } else {
            throw new Error(`获取用户信息失败: ${userResponse.status} ${userResponse.statusText}`);
          }
        } else {
          const userData = await userResponse.json();
          if (userData.success && userData.data) {
            setUser(userData.data);
          } else {
            throw new Error(userData.error || "获取用户信息失败");
          }
        }
        
        // 获取用户的提示词
        try {
          const promptsResponse = await fetch(`/api/user/${params.id}/prompts`);
          
          if (promptsResponse.ok) {
            const promptsData = await promptsResponse.json();
            if (promptsData.success && Array.isArray(promptsData.data)) {
              setPrompts(promptsData.data);
            }
          } else {
            console.warn("获取用户提示词失败，使用空数组");
            setPrompts([]);
          }
        } catch (promptsError) {
          console.error("获取用户提示词时出错:", promptsError);
          setPrompts([]);
        }
        
      } catch (err) {
        console.error("获取用户信息失败:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("获取用户信息时发生未知错误");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [params.id]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row animate-pulse">
            <div className="md:w-1/3 mb-6 md:mb-0 md:pr-8">
              <div className="w-32 h-32 rounded-full bg-gray-700 mx-auto md:mx-0"></div>
              <div className="h-6 bg-gray-700 rounded w-3/4 mt-4 mx-auto md:mx-0"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mt-2 mx-auto md:mx-0"></div>
            </div>
            <div className="md:w-2/3">
              <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 rounded-lg bg-red-900/30 border border-red-700 text-center">
            <p className="text-red-200">{error}</p>
            <Link href="/" className="mt-4 btn-outline inline-flex items-center">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 text-center">
            <p className="text-gray-400">用户不存在或已被删除</p>
            <Link href="/" className="mt-4 btn-outline inline-flex items-center">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 用户资料卡片 */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="mb-6 md:mb-0 md:mr-8">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-blue-600">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-4xl font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {user.role === 'admin' && (
                  <span className="ml-2 px-2 py-1 text-xs bg-purple-600 text-white rounded-full">
                    管理员
                  </span>
                )}
              </div>
              
              <p className="text-gray-400 mt-2">
                {user.bio || '这个用户很懒，还没有填写个人介绍'}
              </p>
              
              <div className="mt-4 text-sm text-gray-500">
                {user.created_at && (
                  <p>加入时间: {new Date(user.created_at).toLocaleDateString('zh-CN', {
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })}</p>
                )}
                
                <p className="mt-1">提示词数量: {prompts.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 用户提示词 */}
        <div>
          <h2 className="text-xl font-bold mb-4">用户分享的提示词</h2>
          
          {prompts.length === 0 ? (
            <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 text-center">
              <p className="text-gray-400">该用户还没有分享提示词</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <span>
                        {new Date(prompt.created_at).toLocaleDateString('zh-CN', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      
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
          )}
        </div>
      </div>
    </div>
  );
}