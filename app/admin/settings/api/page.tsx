"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn, hasRole, getToken } from '../../../../lib/auth';

interface ApiSetting {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  description: string;
  authRequired: boolean;
  adminOnly: boolean;
  rateLimit: number;
  status: 'active' | 'inactive' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export default function ApiSettingsPage() {
  const router = useRouter();
  const [apiEndpoints, setApiEndpoints] = useState<ApiSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentTab, setCurrentTab] = useState<'endpoints' | 'keys' | 'logs'>('endpoints');
  const [editingEndpoint, setEditingEndpoint] = useState<ApiSetting | null>(null);
  
  useEffect(() => {
    // 检查权限并加载数据
    const checkAuth = async () => {
      if (!isLoggedIn()) {
        router.push('/login?redirect=/admin/settings/api');
        return;
      }
      
      if (!hasRole('admin')) {
        setError('您没有权限访问此页面');
        setLoading(false);
        return;
      }
      
      setIsAdmin(true);
      fetchApiSettings();
    };
    
    checkAuth();
  }, [router]);
  
  // 获取API设置数据
  const fetchApiSettings = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      // 模拟API数据
      const mockApiEndpoints: ApiSetting[] = [
        {
          id: '1',
          name: '获取提示词列表',
          endpoint: '/api/prompts',
          method: 'GET',
          description: '获取提示词列表，支持分页和筛选',
          authRequired: false,
          adminOnly: false,
          rateLimit: 60,
          status: 'active',
          createdAt: '2024-04-01T00:00:00Z',
          updatedAt: '2024-04-01T00:00:00Z'
        },
        {
          id: '2',
          name: '获取单个提示词',
          endpoint: '/api/prompts/:id',
          method: 'GET',
          description: '根据ID获取单个提示词详情',
          authRequired: false,
          adminOnly: false,
          rateLimit: 60,
          status: 'active',
          createdAt: '2024-04-01T00:00:00Z',
          updatedAt: '2024-04-01T00:00:00Z'
        },
        {
          id: '3',
          name: '创建提示词',
          endpoint: '/api/prompts',
          method: 'POST',
          description: '创建新的提示词',
          authRequired: true,
          adminOnly: false,
          rateLimit: 30,
          status: 'active',
          createdAt: '2024-04-01T00:00:00Z',
          updatedAt: '2024-04-01T00:00:00Z'
        },
        {
          id: '4',
          name: '更新提示词',
          endpoint: '/api/prompts/:id',
          method: 'PUT',
          description: '更新现有提示词',
          authRequired: true,
          adminOnly: false,
          rateLimit: 30,
          status: 'active',
          createdAt: '2024-04-01T00:00:00Z',
          updatedAt: '2024-04-01T00:00:00Z'
        },
        {
          id: '5',
          name: '删除提示词',
          endpoint: '/api/prompts/:id',
          method: 'DELETE',
          description: '删除提示词',
          authRequired: true,
          adminOnly: false,
          rateLimit: 20,
          status: 'active',
          createdAt: '2024-04-01T00:00:00Z',
          updatedAt: '2024-04-01T00:00:00Z'
        },
        {
          id: '6',
          name: '管理员审核提示词',
          endpoint: '/api/admin/prompts/:id/review',
          method: 'PUT',
          description: '管理员审核提示词',
          authRequired: true,
          adminOnly: true,
          rateLimit: 100,
          status: 'active',
          createdAt: '2024-04-01T00:00:00Z',
          updatedAt: '2024-04-01T00:00:00Z'
        },
        {
          id: '7',
          name: '用户点赞提示词',
          endpoint: '/api/prompts/:id/like',
          method: 'POST',
          description: '用户对提示词进行点赞',
          authRequired: true,
          adminOnly: false,
          rateLimit: 60,
          status: 'active',
          createdAt: '2024-04-01T00:00:00Z',
          updatedAt: '2024-04-01T00:00:00Z'
        },
        {
          id: '8',
          name: '取消点赞',
          endpoint: '/api/prompts/:id/like',
          method: 'DELETE',
          description: '用户取消对提示词的点赞',
          authRequired: true,
          adminOnly: false,
          rateLimit: 60,
          status: 'active',
          createdAt: '2024-04-01T00:00:00Z',
          updatedAt: '2024-04-01T00:00:00Z'
        },
        {
          id: '9',
          name: '获取评论列表',
          endpoint: '/api/prompts/comments',
          method: 'GET',
          description: '获取提示词评论列表',
          authRequired: false,
          adminOnly: false,
          rateLimit: 100,
          status: 'active',
          createdAt: '2024-04-01T00:00:00Z',
          updatedAt: '2024-04-01T00:00:00Z'
        },
        {
          id: '10',
          name: '添加评论',
          endpoint: '/api/prompts/comments',
          method: 'POST',
          description: '为提示词添加评论',
          authRequired: true,
          adminOnly: false,
          rateLimit: 30,
          status: 'active',
          createdAt: '2024-04-01T00:00:00Z',
          updatedAt: '2024-04-01T00:00:00Z'
        }
      ];
      
      // 模拟异步请求
      setTimeout(() => {
        setApiEndpoints(mockApiEndpoints);
        setLoading(false);
      }, 500);
      
      // 实际API实现
      // const response = await fetch('/api/admin/settings/api', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // 
      // const data = await response.json();
      // 
      // if (data.success) {
      //   setApiEndpoints(data.endpoints);
      // } else {
      //   setError(data.error || '获取API设置失败');
      // }
    } catch (err) {
      setError('加载API设置数据时发生错误');
      console.error('获取API设置失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 更改API状态
  const handleStatusChange = (id: string, newStatus: 'active' | 'inactive' | 'deprecated') => {
    setApiEndpoints(prevEndpoints => 
      prevEndpoints.map(endpoint => 
        endpoint.id === id 
          ? { ...endpoint, status: newStatus, updatedAt: new Date().toISOString() } 
          : endpoint
      )
    );
    
    // 实际API实现
    // const saveStatus = async () => {
    //   try {
    //     const token = getToken();
    //     const response = await fetch(`/api/admin/settings/api/${id}`, {
    //       method: 'PUT',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${token}`
    //       },
    //       body: JSON.stringify({ status: newStatus })
    //     });
    //     
    //     const data = await response.json();
    //     if (!data.success) {
    //       throw new Error(data.error);
    //     }
    //   } catch (err) {
    //     console.error('更新API状态失败:', err);
    //     alert('状态更新失败，请重试');
    //   }
    // };
    // 
    // saveStatus();
  };
  
  // 编辑API端点
  const handleEditEndpoint = (endpoint: ApiSetting) => {
    setEditingEndpoint(endpoint);
  };
  
  // 保存编辑后的API端点
  const handleSaveEndpoint = () => {
    if (!editingEndpoint) return;
    
    setApiEndpoints(prevEndpoints => 
      prevEndpoints.map(endpoint => 
        endpoint.id === editingEndpoint.id 
          ? { ...editingEndpoint, updatedAt: new Date().toISOString() } 
          : endpoint
      )
    );
    
    setEditingEndpoint(null);
    
    // 实际API实现类似上方的handleStatusChange
  };
  
  // 获取状态样式类
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'deprecated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 获取HTTP方法样式类
  const getMethodClasses = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 如果没有管理员权限，显示错误信息
  if (!isAdmin && !loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
          <p>{error || '您没有权限访问此页面'}</p>
        </div>
        <Link href="/admin" className="text-blue-600 hover:underline">
          返回管理首页
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">API 管理</h1>
          <p className="text-gray-600">管理系统API端点、访问密钥和使用日志</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href="/admin/settings"
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            返回设置
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* 选项卡导航 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setCurrentTab('endpoints')}
            className={`py-4 px-6 font-medium text-sm ${
              currentTab === 'endpoints'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            API 端点
          </button>
          <button
            onClick={() => setCurrentTab('keys')}
            className={`py-4 px-6 font-medium text-sm ${
              currentTab === 'keys'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            访问密钥
          </button>
          <button
            onClick={() => setCurrentTab('logs')}
            className={`py-4 px-6 font-medium text-sm ${
              currentTab === 'logs'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            使用日志
          </button>
        </nav>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {currentTab === 'endpoints' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-medium">API 端点列表</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  添加新端点
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        名称
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        端点
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        方法
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        限制
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        权限
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiEndpoints.map((endpoint) => (
                      <tr key={endpoint.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{endpoint.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{endpoint.endpoint}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMethodClasses(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {endpoint.rateLimit}/分钟
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {endpoint.authRequired ? (
                            endpoint.adminOnly ? (
                              <span className="text-red-600">仅管理员</span>
                            ) : (
                              <span className="text-yellow-600">需授权</span>
                            )
                          ) : (
                            <span className="text-green-600">公开</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(endpoint.status)}`}>
                            {endpoint.status === 'active' ? '已启用' : 
                             endpoint.status === 'inactive' ? '已禁用' : '已弃用'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditEndpoint(endpoint)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              编辑
                            </button>
                            <div className="relative inline-block text-left">
                              <div>
                                <button
                                  type="button"
                                  className="text-gray-500 hover:text-gray-700"
                                  onClick={() => handleStatusChange(
                                    endpoint.id, 
                                    endpoint.status === 'active' ? 'inactive' : 'active'
                                  )}
                                >
                                  {endpoint.status === 'active' ? '禁用' : '启用'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {apiEndpoints.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-gray-500">没有找到API端点</p>
                </div>
              )}
            </div>
          )}
          
          {currentTab === 'keys' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-medium">API 访问密钥</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  生成新密钥
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-500 italic">此页面将显示API访问密钥管理功能</p>
                <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-center">暂无访问密钥数据</p>
                </div>
              </div>
            </div>
          )}
          
          {currentTab === 'logs' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-medium">API 使用日志</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-500 italic">此页面将显示API使用日志</p>
                <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-center">暂无API使用日志数据</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* 编辑API端点弹窗 */}
      {editingEndpoint && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      编辑 API 端点
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="endpoint-name" className="block text-sm font-medium text-gray-700">
                          名称
                        </label>
                        <input
                          type="text"
                          id="endpoint-name"
                          value={editingEndpoint.name}
                          onChange={(e) => setEditingEndpoint({...editingEndpoint, name: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="endpoint-path" className="block text-sm font-medium text-gray-700">
                          端点路径
                        </label>
                        <input
                          type="text"
                          id="endpoint-path"
                          value={editingEndpoint.endpoint}
                          onChange={(e) => setEditingEndpoint({...editingEndpoint, endpoint: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="endpoint-method" className="block text-sm font-medium text-gray-700">
                          HTTP方法
                        </label>
                        <select
                          id="endpoint-method"
                          value={editingEndpoint.method}
                          onChange={(e) => setEditingEndpoint({...editingEndpoint, method: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="endpoint-description" className="block text-sm font-medium text-gray-700">
                          描述
                        </label>
                        <textarea
                          id="endpoint-description"
                          value={editingEndpoint.description}
                          onChange={(e) => setEditingEndpoint({...editingEndpoint, description: e.target.value})}
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        ></textarea>
                      </div>
                      <div>
                        <label htmlFor="endpoint-rate-limit" className="block text-sm font-medium text-gray-700">
                          速率限制 (每分钟)
                        </label>
                        <input
                          type="number"
                          id="endpoint-rate-limit"
                          value={editingEndpoint.rateLimit}
                          onChange={(e) => setEditingEndpoint({...editingEndpoint, rateLimit: parseInt(e.target.value)})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          id="endpoint-auth-required"
                          type="checkbox"
                          checked={editingEndpoint.authRequired}
                          onChange={(e) => setEditingEndpoint({...editingEndpoint, authRequired: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="endpoint-auth-required" className="ml-2 block text-sm text-gray-900">
                          需要授权
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="endpoint-admin-only"
                          type="checkbox"
                          checked={editingEndpoint.adminOnly}
                          onChange={(e) => setEditingEndpoint({...editingEndpoint, adminOnly: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="endpoint-admin-only" className="ml-2 block text-sm text-gray-900">
                          仅限管理员
                        </label>
                      </div>
                      <div>
                        <label htmlFor="endpoint-status" className="block text-sm font-medium text-gray-700">
                          状态
                        </label>
                        <select
                          id="endpoint-status"
                          value={editingEndpoint.status}
                          onChange={(e) => setEditingEndpoint({...editingEndpoint, status: e.target.value as 'active' | 'inactive' | 'deprecated'})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="active">已启用</option>
                          <option value="inactive">已禁用</option>
                          <option value="deprecated">已弃用</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveEndpoint}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEndpoint(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 