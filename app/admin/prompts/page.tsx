"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn, hasRole, getToken } from '../../../lib/auth';

// 提示词类型定义
interface Prompt {
  id: number;
  title: string;
  content: string;
  description: string;
  category: string;
  model: string;
  author: string;
  userId: number;
  status: string;
  date: string;
  likes: number;
}

export default function AdminPromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending'); // 默认显示待审核的提示词
  const [pendingCount, setPendingCount] = useState(0);
  
  // 检查权限并加载提示词数据
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoggedIn()) {
        router.push('/login?redirect=/admin/prompts');
        return;
      }
      
      if (!hasRole('admin')) {
        setError('您没有权限访问此页面');
        setLoading(false);
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(true);
      fetchPrompts(statusFilter);
      fetchPendingCount();
    };
    
    checkAuth();
  }, [router]);
  
  // 获取提示词列表
  const fetchPrompts = async (status: string = 'all') => {
    try {
      setLoading(true);
      const token = getToken();
      
      let url = '/api/admin/prompts';
      if (status !== 'all') {
        const statusMap: {[key: string]: string} = {
          'pending': '待审核',
          'approved': '已通过',
          'rejected': '已拒绝'
        };
        url += `?status=${statusMap[status]}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPrompts(data.prompts || []);
      } else {
        setError(data.error || '获取提示词列表失败');
      }
    } catch (err) {
      setError('加载提示词数据时发生错误');
      console.error('获取提示词列表失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 获取待审核提示词数量
  const fetchPendingCount = async () => {
    try {
      const token = getToken();
      
      const response = await fetch('/api/admin/prompts?status=待审核&countOnly=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPendingCount(data.count || 0);
      }
    } catch (err) {
      console.error('获取待审核数量失败:', err);
    }
  };
  
  // 处理状态过滤变化
  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
    fetchPrompts(filter);
  };
  
  // 审核提示词
  const handleReviewPrompt = async (promptId: number, newStatus: string) => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`/api/admin/prompts/${promptId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPrompts(prev => prev.filter(p => p.id !== promptId));
        fetchPendingCount();
        alert(`提示词已${newStatus === '已通过' ? '通过审核' : '被拒绝'}`);
      } else {
        alert(`操作失败: ${data.error}`);
      }
    } catch (err) {
      console.error('审核提示词失败:', err);
      alert('审核提示词时发生错误');
    } finally {
      setLoading(false);
    }
  };
  
  // 删除提示词
  const handleDeletePrompt = async (promptId: number) => {
    if (!confirm('确定要删除这个提示词吗？此操作不可恢复。')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`/api/admin/prompts/${promptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPrompts(prev => prev.filter(p => p.id !== promptId));
        fetchPendingCount();
        alert('提示词已成功删除');
      } else {
        alert(`删除失败: ${data.error}`);
      }
    } catch (err) {
      console.error('删除提示词失败:', err);
      alert('删除提示词时发生错误');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取模型颜色
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
  
  // 获取状态颜色
  const getStatusColor = (status: string): string => {
    const statusColors: {[key: string]: string} = {
      '待审核': 'bg-yellow-900 text-yellow-100',
      '已通过': 'bg-green-900 text-green-100',
      '已拒绝': 'bg-red-900 text-red-100'
    };
    
    return statusColors[status] || 'bg-gray-700 text-gray-100';
  };
  
  // 如果没有管理员权限，显示错误信息
  if (!isAdmin && !loading) {
    return (
      <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
        <div className="bg-red-800 text-white p-4 rounded-lg mb-6">
          <p>{error || '您没有权限访问此页面'}</p>
        </div>
        <Link href="/" className="text-blue-400 hover:underline">
          返回首页
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">提示词管理</h1>
          {pendingCount > 0 && (
            <p className="text-yellow-400 mt-1">
              您有 {pendingCount} 个待审核的提示词
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            用户管理
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-800 text-white p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => handleFilterChange('pending')}
          className={`px-3 py-1 rounded-md text-sm ${
            statusFilter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          待审核 {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          onClick={() => handleFilterChange('approved')}
          className={`px-3 py-1 rounded-md text-sm ${
            statusFilter === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          已通过
        </button>
        <button
          onClick={() => handleFilterChange('rejected')}
          className={`px-3 py-1 rounded-md text-sm ${
            statusFilter === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          已拒绝
        </button>
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-3 py-1 rounded-md text-sm ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          全部
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4">加载中...</p>
        </div>
      ) : (
        <>
          {prompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prompts.map(prompt => (
                <div key={prompt.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">{prompt.title}</h3>
                        <p className="text-gray-400 text-sm">
                          作者: {typeof prompt.author === 'object' ? prompt.author.name : prompt.author} (ID: {prompt.userId})
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(prompt.status)}`}>
                          {prompt.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getModelColor(prompt.model)}`}>
                          {prompt.model}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded-lg my-3">
                      <p className="text-gray-200 whitespace-pre-wrap">{prompt.content}</p>
                    </div>
                    
                    {prompt.description && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-300 mb-1">描述:</h4>
                        <p className="text-gray-400 text-sm">{prompt.description}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">
                        提交日期: {new Date(prompt.date).toLocaleDateString()}
                      </span>
                      <span className="text-gray-400">
                        ❤️ {prompt.likes || 0}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-700 mt-4 pt-4">
                      {prompt.status === '待审核' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReviewPrompt(prompt.id, '已通过')}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => handleReviewPrompt(prompt.id, '已拒绝')}
                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                          >
                            拒绝
                          </button>
                          <button
                            onClick={() => handleDeletePrompt(prompt.id)}
                            className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm ml-auto"
                          >
                            删除
                          </button>
                        </div>
                      )}
                      
                      {prompt.status !== '待审核' && (
                        <div className="flex justify-end space-x-2">
                          {prompt.status === '已通过' && (
                            <button
                              onClick={() => handleReviewPrompt(prompt.id, '已拒绝')}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                            >
                              拒绝
                            </button>
                          )}
                          {prompt.status === '已拒绝' && (
                            <button
                              onClick={() => handleReviewPrompt(prompt.id, '已通过')}
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                            >
                              通过
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePrompt(prompt.id)}
                            className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                          >
                            删除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-800 rounded-lg">
              <h3 className="text-xl mb-2">
                {statusFilter === 'pending' 
                  ? '没有待审核的提示词' 
                  : statusFilter === 'approved' 
                    ? '没有已通过的提示词' 
                    : statusFilter === 'rejected' 
                      ? '没有已拒绝的提示词'
                      : '没有提示词数据'}
              </h3>
              {statusFilter === 'pending' && (
                <p className="text-gray-400">
                  所有提示词都已审核完毕
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 