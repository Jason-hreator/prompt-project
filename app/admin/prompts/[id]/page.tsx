"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// 定义提示词接口
interface Prompt {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  model: string;
  status: string;
  date: string;
  likes: number;
  comments: number;
}

export default function PromptDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: '',
    model: '',
    status: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 获取提示词详情
  const fetchPromptDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/prompts/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setPrompt(data.data);
        setFormData({
          title: data.data.title,
          content: data.data.content,
          author: data.data.author,
          category: data.data.category,
          model: data.data.model,
          status: data.data.status,
        });
      } else {
        setError(data.error || '获取提示词数据失败');
      }
    } catch (err) {
      setError('获取提示词详情时发生错误');
      console.error('获取提示词详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPromptDetails();
    }
  }, [id]);

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch(`/api/admin/prompts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(data.message || '提示词更新成功');
        setPrompt({
          ...prompt!,
          ...formData,
        });
        setIsEditing(false);
        // 刷新数据
        fetchPromptDetails();
      } else {
        setError(data.error || '更新失败');
      }
    } catch (err) {
      setError('更新提示词时发生错误');
      console.error('更新提示词失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 删除提示词
  const handleDelete = async () => {
    if (!confirm('确定要删除这个提示词吗？此操作不可恢复。')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/prompts?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message || '提示词已成功删除');
        // 重定向到提示词列表
        router.push('/admin/prompts');
      } else {
        setError(data.error || '删除失败');
      }
    } catch (err) {
      setError('删除时发生错误');
      console.error('删除提示词失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 返回表单或详情
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      );
    }
    
    if (!prompt) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">未找到提示词</p>
        </div>
      );
    }
    
    if (isEditing) {
      return (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">标题</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">内容</label>
            <textarea
              id="content"
              name="content"
              rows={10}
              value={formData.content}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">作者</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">分类</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">选择分类</option>
                <option value="学习工具">学习工具</option>
                <option value="效率工具">效率工具</option>
                <option value="写作助手">写作助手</option>
                <option value="编程开发">编程开发</option>
                <option value="创意灵感">创意灵感</option>
                <option value="角色扮演">角色扮演</option>
                <option value="其他工具">其他工具</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">AI模型</label>
              <select
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">选择模型</option>
                <option value="GPT-3.5">GPT-3.5</option>
                <option value="GPT-4">GPT-4</option>
                <option value="Claude-2">Claude-2</option>
                <option value="Claude-3">Claude-3</option>
                <option value="Gemini">Gemini</option>
                <option value="通用">通用</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">状态</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="待审核">待审核</option>
                <option value="已发布">已发布</option>
                <option value="已拒绝">已拒绝</option>
                <option value="草稿">草稿</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      );
    }
    
    return (
      <div>
        {/* 成功消息 */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setSuccessMessage('')}
                    className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none"
                  >
                    <span className="sr-only">关闭</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{prompt.title}</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                编辑
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                删除
              </button>
            </div>
          </div>
          
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 mb-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">作者</dt>
              <dd className="mt-1 text-sm text-gray-900">{prompt.author}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">分类</dt>
              <dd className="mt-1 text-sm text-gray-900">{prompt.category}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">AI模型</dt>
              <dd className="mt-1 text-sm text-gray-900">{prompt.model}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">状态</dt>
              <dd className="mt-1 text-sm">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  prompt.status === '已发布'
                    ? 'bg-green-100 text-green-800'
                    : prompt.status === '待审核'
                    ? 'bg-yellow-100 text-yellow-800'
                    : prompt.status === '已拒绝'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {prompt.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">创建日期</dt>
              <dd className="mt-1 text-sm text-gray-900">{prompt.date}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">点赞数</dt>
              <dd className="mt-1 text-sm text-gray-900">{prompt.likes}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">评论数</dt>
              <dd className="mt-1 text-sm text-gray-900">{prompt.comments}</dd>
            </div>
          </dl>
          
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-3">提示词内容</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{prompt.content}</pre>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/prompts" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span className="ml-1">返回提示词列表</span>
        </Link>
      </div>
      {renderContent()}
    </div>
  );
} 