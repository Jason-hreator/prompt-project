"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn, hasRole, getToken } from '../../../../lib/auth';

// 提示词类型定义
interface Prompt {
  id: number;
  userId: string;
  username: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export default function AdminReviewPendingPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });
  
  // 检查权限并加载数据
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoggedIn()) {
        router.push('/login?redirect=/admin/reviews/pending');
        return;
      }
      
      if (!hasRole('admin')) {
        setError('您没有权限访问此页面');
        setLoading(false);
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(true);
      fetchPendingPrompts();
    };
    
    checkAuth();
  }, [router, pagination.page]);
  
  // 获取待审核提示词
  const fetchPendingPrompts = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`/api/admin/prompts/review?status=pending&page=${pagination.page}&limit=${pagination.limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPrompts(data.prompts);
        setPagination(data.pagination);
      } else {
        setError(data.error || '获取待审核提示词失败');
      }
    } catch (err) {
      setError('加载数据时发生错误');
      console.error('获取待审核提示词失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 打开拒绝弹窗
  const openRejectModal = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setRejectionReason('');
    setIsModalOpen(true);
  };
  
  // 关闭弹窗
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
  };
  
  // 处理审核操作
  const handleReview = async (promptId: number, status: string, reason?: string) => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch('/api/admin/prompts/review', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          promptId,
          status,
          reason
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 审核成功后刷新列表
        fetchPendingPrompts();
        closeModal();
        alert(`提示词${status === 'approved' ? '已批准' : '已拒绝'}`);
      } else {
        alert(`操作失败: ${data.error}`);
        setLoading(false);
      }
    } catch (err) {
      console.error('审核操作失败:', err);
      alert('执行审核操作时发生错误');
      setLoading(false);
    }
  };
  
  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
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
        <h1 className="text-3xl font-bold">待审核提示词</h1>
        <div className="flex space-x-2">
          <Link 
            href="/admin/reviews"
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            返回审核中心
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-800 text-white p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4">加载中...</p>
        </div>
      ) : (
        <>
          {prompts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {prompts.map(prompt => (
                <div key={prompt.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold">{prompt.title}</h3>
                      <span className="px-2 py-1 bg-yellow-600 text-white rounded-full text-xs">
                        待审核
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm">
                        作者: {prompt.username} | 分类: {prompt.category} | 
                        提交时间: {new Date(prompt.createdAt).toLocaleString('zh-CN')}
                      </p>
                      <div className="flex flex-wrap mt-2">
                        {prompt.tags.map((tag, idx) => (
                          <span key={idx} className="bg-blue-900 text-blue-100 text-xs px-2 py-1 rounded-full mr-2 mb-2">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded-lg mb-4 whitespace-pre-wrap">
                      {prompt.content.length > 500 
                        ? `${prompt.content.substring(0, 500)}...` 
                        : prompt.content}
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/prompts/${prompt.id}`}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        target="_blank"
                      >
                        完整查看
                      </Link>
                      <button
                        onClick={() => openRejectModal(prompt)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        拒绝
                      </button>
                      <button
                        onClick={() => handleReview(prompt.id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        批准
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">目前没有待审核的提示词</p>
            </div>
          )}
          
          {/* 分页控制 */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-3 py-1 rounded-md ${
                    pagination.page === 1
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  上一页
                </button>
                
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 rounded-md ${
                      pagination.page === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className={`px-3 py-1 rounded-md ${
                    pagination.page === pagination.pages
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  下一页
                </button>
              </nav>
            </div>
          )}
        </>
      )}
      
      {/* 拒绝原因弹窗 */}
      {isModalOpen && selectedPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">拒绝提示词</h3>
            <p className="mb-2">提示词: {selectedPrompt.title}</p>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">拒绝原因</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                rows={4}
                placeholder="请输入拒绝理由，将会通知投稿者"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleReview(selectedPrompt.id, 'rejected', rejectionReason)}
                disabled={!rejectionReason.trim()}
                className={`px-4 py-2 rounded-lg ${
                  !rejectionReason.trim()
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 