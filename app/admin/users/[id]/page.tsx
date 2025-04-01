"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// 用户数据类型
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: string;
  bio: string;
  website: string;
  location: string;
  registerDate: string;
  lastLogin: string;
  promptsCount: number;
  commentsCount: number;
  likesCount: number;
}

// 表单数据类型
interface FormData {
  name: string;
  email: string;
  role: string;
  status: string;
  bio: string;
  website: string;
  location: string;
  avatar: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: '',
    status: '',
    bio: '',
    website: '',
    location: '',
    avatar: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // 获取用户数据
  const fetchUserDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log(`获取用户详情，ID: ${id}`);
      
      const response = await fetch(`/api/admin/users/${id}`);
      const data = await response.json();
      
      console.log('API响应:', data);
      
      if (data.success) {
        setUser(data.data);
        setFormData({
          name: data.data.name,
          email: data.data.email,
          role: data.data.role,
          status: data.data.status,
          bio: data.data.bio || '',
          website: data.data.website || '',
          location: data.data.location || '',
          avatar: data.data.avatar || ''
        });
      } else {
        setError(data.error || '获取用户详情失败');
      }
    } catch (err) {
      console.error('获取用户详情失败:', err);
      setError('获取用户详情时发生错误: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载时获取数据
  useEffect(() => {
    fetchUserDetails();
  }, [id]);
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      console.log(`更新用户信息，ID: ${id}`, formData);
      
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      console.log('更新用户响应:', data);
      
      if (data.success) {
        setSuccessMessage(data.message || '用户信息已成功更新');
        setUser(data.data);
        setIsEditing(false);
      } else {
        setError(data.error || '更新失败');
      }
    } catch (err) {
      console.error('更新用户失败:', err);
      setError('更新用户信息时发生错误: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  // 处理删除
  const handleDelete = async () => {
    if (!confirm('确定要删除这个用户吗？此操作不可恢复。')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log(`删除用户，ID: ${id}`);
      
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      console.log('删除用户响应:', data);
      
      if (data.success) {
        alert(data.message || '用户已成功删除');
        // 重定向到用户列表
        router.push('/admin/users');
      } else {
        setError(data.error || '删除失败');
      }
    } catch (err) {
      console.error('删除用户失败:', err);
      setError('删除用户时发生错误: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  // 可用的角色和状态选项
  const roleOptions = ['管理员', '高级用户', '普通用户'];
  const statusOptions = ['活跃', '待验证', '已禁用', '休眠'];
  
  // 渲染加载状态
  if (loading && !user) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">加载中...</p>
      </div>
    );
  }
  
  // 渲染错误状态
  if (error && !user) {
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
            <div className="mt-2">
              <Link href="/admin/users" className="text-red-700 hover:text-red-900 underline">
                返回用户列表
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // 如果无法获取用户数据
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">无法加载用户数据</p>
        <div className="mt-4">
          <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 underline">
            返回用户列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">用户详情</h1>
          <p className="text-gray-600">查看和管理用户信息</p>
        </div>
        <div className="flex mt-4 space-x-3 sm:mt-0">
          <Link 
            href="/admin/users" 
            className="text-gray-600 hover:text-gray-800"
          >
            返回用户列表
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

      {/* 用户信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden mb-4">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-full h-full text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2a8 8 0 00-8 8 1 1 0 001 1h14a1 1 0 001-1 8 8 0 00-8-8z" />
                    </svg>
                  )}
                </div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-600 mb-2">{user.email}</p>
                <div className="flex space-x-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === '管理员' ? 'bg-purple-100 text-purple-800' :
                    user.role === '高级用户' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === '活跃' ? 'bg-green-100 text-green-800' :
                    user.status === '待验证' ? 'bg-yellow-100 text-yellow-800' :
                    user.status === '已禁用' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
              
              {!isEditing && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                      disabled={loading}
                    >
                      编辑
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                      disabled={loading}
                    >
                      删除
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-6 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-3">用户统计</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-semibold">{user.promptsCount}</div>
                  <div className="text-xs text-gray-500">提示词</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold">{user.commentsCount}</div>
                  <div className="text-xs text-gray-500">评论</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold">{user.likesCount}</div>
                  <div className="text-xs text-gray-500">点赞</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-500">注册日期</span>
                  <span className="text-xs font-medium">{user.registerDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">最后登录</span>
                  <span className="text-xs font-medium">{user.lastLogin}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">编辑用户信息</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      用户名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      邮箱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      角色 <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      状态 <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                    头像URL
                  </label>
                  <input
                    type="text"
                    id="avatar"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    个人简介
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                      网站
                    </label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      位置
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="城市, 省份"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // 重置表单数据
                      setFormData({
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        status: user.status,
                        bio: user.bio || '',
                        website: user.website || '',
                        location: user.location || '',
                        avatar: user.avatar || ''
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={loading}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? '保存中...' : '保存更改'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">用户详细信息</h3>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">个人简介</h4>
                  <p className="text-gray-800">{user.bio || '暂无个人简介'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">联系方式</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-gray-600 mr-2">邮箱:</span>
                        <span className="text-gray-800">{user.email}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-600 mr-2">网站:</span>
                        <span className="text-gray-800">
                          {user.website ? (
                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {user.website}
                            </a>
                          ) : '暂无'}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-600 mr-2">位置:</span>
                        <span className="text-gray-800">{user.location || '暂无'}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">账户信息</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-gray-600 mr-2">ID:</span>
                        <span className="text-gray-800">{user.id}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-600 mr-2">角色:</span>
                        <span className="text-gray-800">{user.role}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-600 mr-2">状态:</span>
                        <span className="text-gray-800">{user.status}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {!isEditing && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">最近活动</h3>
                
                <div className="flex items-center justify-center h-32 bg-gray-50 rounded-md">
                  <p className="text-gray-400">用户活动记录将在未来版本中提供</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 