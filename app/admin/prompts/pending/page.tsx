"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 状态标签组件
const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800`}>
      {status}
    </span>
  );
};

export default function PendingPromptsPage() {
  const [promptsData, setPromptsData] = useState<any[]>([]);
  const [selectedPrompts, setSelectedPrompts] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 获取待审核提示词数据
  const fetchPendingPrompts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('status', '待审核');
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', itemsPerPage.toString());
      
      const response = await fetch(`/api/admin/prompts?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setPromptsData(data.data.prompts);
        setTotalItems(data.data.total);
        setTotalPages(data.data.totalPages);
      } else {
        setError(data.error || '获取数据失败');
      }
    } catch (err) {
      setError('获取数据时发生错误');
      console.error('获取待审核提示词数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和分页变化时获取数据
  useEffect(() => {
    fetchPendingPrompts();
  }, [currentPage, itemsPerPage]);

  // 处理选择提示词
  const handleSelectPrompt = (id: number) => {
    if (selectedPrompts.includes(id)) {
      setSelectedPrompts(selectedPrompts.filter(promptId => promptId !== id));
    } else {
      setSelectedPrompts([...selectedPrompts, id]);
    }
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectedPrompts.length === promptsData.length) {
      setSelectedPrompts([]);
    } else {
      setSelectedPrompts(promptsData.map(prompt => prompt.id));
    }
  };

  // 批量操作
  const handleBulkAction = async (action: string) => {
    if (selectedPrompts.length === 0) {
      setError('请至少选择一个提示词');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      console.log(`执行批量操作: ${action}，ID列表:`, selectedPrompts);
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          promptIds: selectedPrompts,
        }),
      });
      
      const data = await response.json();
      console.log('批量操作响应:', data);
      
      if (data.success) {
        setSuccessMessage(data.message || `操作成功: ${action}`);
        // 刷新数据
        await fetchPendingPrompts();
        // 清空选择
        setSelectedPrompts([]);
      } else {
        setError(data.error || '操作失败');
      }
    } catch (err) {
      console.error('批量操作失败:', err);
      setError('执行操作时发生错误: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // 计算分页指标
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">待审核提示词</h1>
          <p className="text-gray-600">管理需要审核的提示词内容</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link 
            href="/admin/prompts" 
            className="mr-2 text-blue-600 hover:text-blue-800"
          >
            返回提示词列表
          </Link>
        </div>
      </div>

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

      {/* 错误消息 */}
      {error && (
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
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError('')}
                  className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
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

      {/* 批量操作 */}
      {selectedPrompts.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6 flex justify-between items-center">
          <div>
            <span className="font-medium">已选择 {selectedPrompts.length} 项</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkAction('approve')}
              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
              disabled={loading}
            >
              批量通过
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
              disabled={loading}
            >
              批量拒绝
            </button>
            <button
              onClick={() => setSelectedPrompts([])}
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-300"
              disabled={loading}
            >
              取消选择
            </button>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      )}

      {/* 提示词表格 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedPrompts.length === promptsData.length && promptsData.length > 0}
                    onChange={handleSelectAll}
                    disabled={loading}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作者</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI模型</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建日期</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!loading && promptsData.length > 0 ? (
                promptsData.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedPrompts.includes(prompt.id)}
                        onChange={() => handleSelectPrompt(prompt.id)}
                        disabled={loading}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/prompts/${prompt.id}`} className="text-blue-600 hover:text-blue-900">
                        <div className="text-sm font-medium">{prompt.title}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{prompt.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{prompt.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{prompt.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={prompt.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prompt.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/admin/prompts/${prompt.id}`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          查看
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : !loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    没有找到待审核的提示词
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      {!loading && totalItems > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            显示 <span className="font-medium">{indexOfFirstItem}</span> 到{' '}
            <span className="font-medium">
              {indexOfLastItem}
            </span>{' '}
            条，共 <span className="font-medium">{totalItems}</span> 条
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || loading}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1 || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              首页
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1 || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              上一页
            </button>
            <div className="px-3 py-1 bg-blue-600 text-white rounded-md">
              {currentPage}
            </div>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              下一页
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || loading}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              末页
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 