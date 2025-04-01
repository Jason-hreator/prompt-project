"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn, hasRole, getToken } from '../../../../lib/auth';

// 评论类型定义
interface Comment {
  id: string;
  promptId: number;
  userId: number;
  username: string;
  content: string;
  date: string;
  status: string;
  promptTitle?: string;
}

export default function AdminReviewCommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 默认显示全部评论
  const [reportedCount, setReportedCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 检查权限并加载评论数据
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoggedIn()) {
        router.push('/login?redirect=/admin/reviews/comments');
        return;
      }
      
      if (!hasRole('admin')) {
        setError('您没有权限访问此页面');
        setLoading(false);
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(true);
      fetchComments();
    };
    
    checkAuth();
  }, [router]);
  
  // 获取评论列表
  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch('/api/prompts/comments?admin=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 处理评论数据，添加提示词标题等信息
        const commentsWithPrompts = await Promise.all(
          data.comments.map(async (comment: Comment) => {
            try {
              const promptResponse = await fetch(`/api/prompts/${comment.promptId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              const promptData = await promptResponse.json();
              if (promptData.success) {
                return {
                  ...comment,
                  promptTitle: promptData.prompt.title
                };
              }
              return comment;
            } catch (err) {
              console.error(`获取提示词 ${comment.promptId} 信息失败:`, err);
              return comment;
            }
          })
        );
        
        setComments(commentsWithPrompts || []);
        
        // 统计被举报的评论数量
        const reported = commentsWithPrompts.filter((c: Comment) => c.status === '被举报').length;
        setReportedCount(reported);
      } else {
        setError(data.error || '获取评论列表失败');
      }
    } catch (err) {
      setError('加载评论数据时发生错误');
      console.error('获取评论列表失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 处理状态过滤变化
  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
  };
  
  // 删除评论
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？此操作不可恢复。')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`/api/prompts/comments?id=${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        alert('评论已成功删除');
      } else {
        alert(`删除失败: ${data.error}`);
      }
    } catch (err) {
      console.error('删除评论失败:', err);
      alert('删除评论时发生错误');
    } finally {
      setLoading(false);
    }
  };
  
  // 标记评论为已处理
  const handleMarkAsResolved = async (commentId: string) => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`/api/prompts/comments?id=${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: '正常' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, status: '正常' } 
              : comment
          )
        );
        alert('评论已标记为已处理');
      } else {
        alert(`操作失败: ${data.error}`);
      }
    } catch (err) {
      console.error('更新评论状态失败:', err);
      alert('更新评论状态时发生错误');
    } finally {
      setLoading(false);
    }
  };
  
  // 过滤评论
  const filteredComments = comments.filter(comment => {
    // 状态过滤
    if (statusFilter !== 'all' && comment.status !== statusFilter) {
      return false;
    }
    
    // 搜索过滤
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        comment.content.toLowerCase().includes(searchLower) ||
        comment.username.toLowerCase().includes(searchLower) ||
        (comment.promptTitle && comment.promptTitle.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });
  
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
          <h1 className="text-3xl font-bold">评论管理</h1>
          {reportedCount > 0 && (
            <p className="text-yellow-400 mt-1">
              您有 {reportedCount} 条被举报的评论需要处理
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Link
            href="/admin/prompts"
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            提示词管理
          </Link>
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
      
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          {/* 状态过滤按钮 */}
          <div className="flex space-x-2">
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
            <button
              onClick={() => handleFilterChange('正常')}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === '正常'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              正常
            </button>
            <button
              onClick={() => handleFilterChange('被举报')}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === '被举报'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              被举报 {reportedCount > 0 && `(${reportedCount})`}
            </button>
          </div>
          
          {/* 搜索框 */}
          <div className="w-full md:w-auto">
            <input
              type="text"
              placeholder="搜索评论内容、用户名或提示词标题"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4">加载中...</p>
        </div>
      ) : (
        <>
          {filteredComments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredComments.map(comment => (
                <div key={comment.id} className={`bg-gray-800 rounded-lg shadow-md overflow-hidden border-l-4 ${
                  comment.status === '被举报' ? 'border-red-500' : 'border-green-500'
                }`}>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {comment.username} 
                          <span className="text-gray-400 text-sm ml-2">
                            (用户ID: {comment.userId})
                          </span>
                        </h3>
                        <p className="text-gray-400 text-sm">
                          评论于提示词: {comment.promptTitle || `ID ${comment.promptId}`}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          comment.status === '被举报' ? 'bg-red-900 text-red-100' : 'bg-green-900 text-green-100'
                        }`}>
                          {comment.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded-lg my-3">
                      <p className="text-gray-200 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-gray-400">
                        评论日期: {new Date(comment.date).toLocaleDateString()}
                      </span>
                      
                      <div className="flex space-x-2">
                        {comment.status === '被举报' && (
                          <button
                            onClick={() => handleMarkAsResolved(comment.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            标记为已处理
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          删除
                        </button>
                        <Link
                          href={`/prompts/${comment.promptId}`}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          target="_blank"
                        >
                          查看提示词
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">没有找到符合条件的评论</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 