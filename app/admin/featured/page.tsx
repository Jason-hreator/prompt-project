"use client";

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAuth } from '@/lib/auth';

export default function FeaturedPromptsPage() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchPrompts();
  }, []);

  async function fetchPrompts() {
    try {
      setLoading(true);
      const response = await fetch('/api/prompts?limit=100');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('获取提示词失败');
      }
      
      setPrompts(data.data || []);
    } catch (err) {
      console.error('获取提示词列表失败:', err);
      setError('加载提示词列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleFeature = async (promptId, setFeatured) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/prompts/featured`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promptId,
          featured: setFeatured
        })
      });
      
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }
      
      // 刷新提示词列表
      fetchPrompts();
      
      // 显示成功消息
      setMessage(setFeatured ? '已设为精选提示词' : '已取消精选状态');
      
      // 3秒后清除消息
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('更改精选状态失败:', error);
      setError('操作失败，请稍后重试');
      
      // 3秒后清除错误信息
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // 计算已精选的提示词数量
  const featuredCount = prompts.filter(p => p.is_featured).length;

  return (
    <div>
      <AdminHeader title="精选提示词管理" />
      
      {message && (
        <div className="mb-4 p-3 bg-green-800/50 border border-green-700 rounded">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-800/50 border border-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4 p-4 bg-gray-900/50 border border-gray-800 rounded">
        <p>当前精选提示词数量: <strong>{featuredCount}</strong></p>
        <p className="text-sm text-gray-400 mt-1">建议保持精选提示词数量在10个以内，以保证最佳展示效果</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/60">
              <tr>
                <th className="p-3 text-left">标题</th>
                <th className="p-3 text-left">分类</th>
                <th className="p-3 text-left">作者</th>
                <th className="p-3 text-center">点赞</th>
                <th className="p-3 text-center">精选状态</th>
                <th className="p-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {prompts.map(prompt => (
                <tr key={prompt.id} className="border-t border-gray-800">
                  <td className="p-3">{prompt.title}</td>
                  <td className="p-3">{prompt.category?.name || '未分类'}</td>
                  <td className="p-3">{prompt.author?.name || '未知'}</td>
                  <td className="p-3 text-center">{prompt.likes || 0}</td>
                  <td className="p-3 text-center">
                    {prompt.is_featured ? (
                      <span className="px-2 py-1 bg-yellow-600 text-xs rounded">精选</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-700 text-xs rounded">普通</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {prompt.is_featured ? (
                      <button
                        onClick={() => handleToggleFeature(prompt.id, false)}
                        disabled={loading}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
                      >
                        取消精选
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleFeature(prompt.id, true)}
                        disabled={loading}
                        className="px-3 py-1 bg-gray-600 hover:bg-yellow-600 rounded text-xs"
                      >
                        设为精选
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {prompts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    暂无提示词数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}