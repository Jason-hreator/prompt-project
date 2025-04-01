"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn, hasRole, getToken } from '../../../lib/auth';

// 用户类型定义
interface User {
  id: number;
  username: string;
  name?: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // 弹窗相关状态
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // 表单状态
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  
  // 检查权限并加载用户数据
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          if (!isLoggedIn()) {
            router.push('/login?redirect=/admin/users');
            return;
          }
          
          const adminCheck = hasRole('admin');
          if (!adminCheck) {
            setError('您没有权限访问此页面');
            setLoading(false);
            return;
          }
          
          setIsAdmin(true);
          await fetchUsers();
        }
      } catch (error) {
        console.error('检查权限时出错:', error);
        setError('检查权限时发生错误');
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const token = getToken();
      
      if (!token) {
        setError('您的会话已过期，请重新登录');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || '获取用户列表失败');
      }
    } catch (error) {
      console.error('获取用户列表时出错:', error);
      setError('获取用户列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 打开添加用户弹窗
  const openAddModal = () => {
    setFormData({
      username: '',
      name: '',
      email: '',
      password: '',
      role: 'user'
    });
    setModalType('add');
    setShowModal(true);
  };
  
  // 打开编辑用户弹窗
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || '',
      name: user.name || '',
      email: user.email || '',
      password: '', // 不预填密码
      role: user.role || 'user'
    });
    setModalType('edit');
    setShowModal(true);
  };
  
  // 处理表单字段变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = getToken();
      let url = '/api/admin/users';
      let method = 'POST';
      
      // 如果是编辑模式，使用PUT请求并添加ID
      if (modalType === 'edit' && selectedUser) {
        method = 'PUT';
        formData.id = selectedUser.id;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowModal(false);
        fetchUsers(); // 重新加载用户列表
      } else {
        setError(data.error || '操作失败');
      }
    } catch (err) {
      setError('提交表单时发生错误');
      console.error('提交用户表单失败:', err);
    }
  };
  
  // 删除用户
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('确定要删除此用户吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      const token = getToken();
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchUsers(); // 重新加载用户列表
      } else {
        setError(data.error || '删除用户失败');
      }
    } catch (err) {
      setError('删除用户时发生错误');
      console.error('删除用户失败:', err);
    }
  };
  
  // 格式化日期显示
  const formatDate = (dateString?: string) => {
    if (!dateString) return '从未登录';
    
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <h1 className="text-3xl font-bold">用户管理</h1>
        <div className="flex space-x-2">
          <Link 
            href="/admin/prompts" 
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            提示词管理
          </Link>
          <button 
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            添加用户
          </button>
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
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">用户名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">邮箱</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">角色</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">最后登录</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'
                        }`}>
                          {user.role === 'admin' ? '管理员' : '普通用户'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(user.lastLogin)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="text-blue-400 hover:text-blue-300 mr-3"
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-400">
                      暂无用户数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* 添加/编辑用户弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              {modalType === 'add' ? '添加新用户' : '编辑用户'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium mb-1">用户名</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium mb-1">姓名</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-1">邮箱</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  密码 {modalType === 'edit' && <span className="text-gray-400">(留空表示不修改)</span>}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={modalType === 'add'}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="role" className="block text-sm font-medium mb-1">角色</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {modalType === 'add' ? '添加' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 