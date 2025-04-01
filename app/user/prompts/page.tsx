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

export default function UserPromptsPage() {
  const router = useRouter();
  const [submittedPrompts, setSubmittedPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [submissionFilter, setSubmissionFilter] = useState<string>('all'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login?redirect=/user/prompts');
      return;
    }
    
    setUser(getCurrentUser());
    fetchSubmittedPrompts().then(() => {
      setLoading(false);
    }).catch(err => {
      setError('加载数据失败');
      setLoading(false);
      console.error('加载用户数据错误:', err);
    });
  }, [router]);

  const fetchSubmittedPrompts = async (status: string = 'all') => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) return;
      
      const token = getToken();
      let url = `/api/user/prompts?userId=${currentUser.id}`;
      
      if (status !== 'all') {
        const statusMap: {[key: string]: string} = {
          'pending': '待审核',
          'approved': '已通过',
          'rejected': '已拒绝'
        };
        url += `&status=${statusMap[status]}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmittedPrompts(data.prompts || []);
      } else {
        console.error('获取提交的提示词失败:', data.error);
      }
    } catch (err) {
      console.error('获取提交的提示词错误:', err);
    }
  };

  const handleFilterChange = (filter: string) => {
    setSubmissionFilter(filter);
    fetchSubmittedPrompts(filter);
  };

  const handleWithdrawPrompt = async (promptId: number) => {
    if (!confirm('确定要撤回这个提示词吗？此操作不可恢复。')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`/api/user/prompts?id=${promptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmittedPrompts(prev => prev.filter(p => p.id !== promptId));
        alert('提示词已成功撤回');
      } else {
        alert(`撤回失败: ${data.error}`);
      }
    } catch (err) {
      console.error('撤回提示词错误:', err);
      alert('撤回提示词时发生错误');
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string): string => {
    const statusColors: {[key: string]: string} = {
      '待审核': 'bg-yellow-900 text-yellow-100',
      '已通过': 'bg-green-900 text-green-100',
      '已拒绝': 'bg-red-900 text-red-100'
    };
    
    return statusColors[status] || 'bg-gray-700 text-gray-100';
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
        <h1 className="text-2xl font-bold">我的提示词</h1>
        <p className="text-gray-400">管理您提交的提示词</p>
      </div>
      
      {error && (
        <div className="bg-red-800 text-white p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              submissionFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => handleFilterChange('pending')}
            className={`px-3 py-1 rounded-md text-sm ${
              submissionFilter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            待审核
          </button>
          <button
            onClick={() => handleFilterChange('approved')}
            className={`px-3 py-1 rounded-md text-sm ${
              submissionFilter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            已通过
          </button>
          <button
            onClick={() => handleFilterChange('rejected')}
            className={`px-3 py-1 rounded-md text-sm ${
              submissionFilter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            已拒绝
          </button>
        </div>
        <Link
          href="/submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          提交新提示词
        </Link>
      </div>
      
      {submittedPrompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submittedPrompts.map(prompt => (
            <div key={prompt.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{prompt.title}</h3>
                  <div className="flex space-x-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(prompt.status)}`}>
                      {prompt.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getModelColor(prompt.model)}`}>
                      {prompt.model}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {prompt.description || prompt.content}
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">提交日期: {new Date(prompt.date).toLocaleDateString()}</span>
                  {(prompt.status === '待审核' || prompt.status === '已拒绝') && (
                    <button
                      onClick={() => handleWithdrawPrompt(prompt.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      撤回
                    </button>
                  )}
                  {prompt.status === '已通过' && (
                    <Link
                      href={`/prompts/${prompt.id}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      查看
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-800 rounded-lg">
          <h3 className="text-xl mb-2">暂无提交的提示词</h3>
          <p className="text-gray-400 mb-4">创建并分享您的第一个提示词</p>
          <Link href="/submit" className="inline-block bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            提交提示词
          </Link>
        </div>
      )}
    </div>
  );
} 