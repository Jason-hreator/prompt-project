"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn, hasRole, getToken } from '../../../../lib/auth';

// 权限类型定义
interface Permissions {
  prompts: {
    create: boolean;
    delete: boolean;
    deleteAny: boolean;
    edit: boolean;
    editAny: boolean;
    review: boolean;
    manage: boolean;
  };
  comments: {
    create: boolean;
    delete: boolean;
    deleteAny: boolean;
    manage: boolean;
  };
  users: {
    view: boolean;
    delete: boolean;
    edit: boolean;
    assign: boolean;
    ban: boolean;
  };
  system: {
    settings: boolean;
    categories: boolean;
    colors: boolean;
    analytics: boolean;
    logs: boolean;
  };
}

// 用户类型定义
interface User {
  id: number;
  username: string;
  name?: string;
  email: string;
  role: string;
  permissions?: Permissions;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUserRolesPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // 权限管理状态
  const [permissions, setPermissions] = useState<Permissions>({
    prompts: {
      create: false,
      delete: false,
      deleteAny: false,
      edit: false,
      editAny: false,
      review: false,
      manage: false
    },
    comments: {
      create: false,
      delete: false,
      deleteAny: false,
      manage: false
    },
    users: {
      view: false,
      delete: false,
      edit: false,
      assign: false,
      ban: false
    },
    system: {
      settings: false,
      categories: false,
      colors: false,
      analytics: false,
      logs: false
    }
  });
  
  // 检查权限并加载用户数据
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          if (!isLoggedIn()) {
            router.push('/login?redirect=/admin/users/roles');
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
  
  // 选择用户
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    if (user.permissions) {
      setPermissions(user.permissions);
    } else {
      // 默认权限
      setPermissions({
        prompts: {
          create: false,
          delete: false,
          deleteAny: false,
          edit: false,
          editAny: false,
          review: false,
          manage: false
        },
        comments: {
          create: false,
          delete: false,
          deleteAny: false,
          manage: false
        },
        users: {
          view: false,
          delete: false,
          edit: false,
          assign: false,
          ban: false
        },
        system: {
          settings: false,
          categories: false,
          colors: false,
          analytics: false,
          logs: false
        }
      });
    }
  };
  
  // 处理权限变更
  const handlePermissionChange = (category: string, action: string, checked: boolean) => {
    setPermissions(prevPermissions => {
      const newPermissions = { ...prevPermissions };
      newPermissions[category][action] = checked;
      return newPermissions;
    });
  };
  
  // 全选/取消全选某个类别的所有权限
  const handleCategoryPermissionToggle = (category: string, checked: boolean) => {
    setPermissions(prevPermissions => {
      const newPermissions = { ...prevPermissions };
      Object.keys(newPermissions[category]).forEach(action => {
        newPermissions[category][action] = checked;
      });
      return newPermissions;
    });
  };
  
  // 全选所有权限
  const handleAllPermissionsToggle = (checked: boolean) => {
    setPermissions(prevPermissions => {
      const newPermissions = { ...prevPermissions };
      Object.keys(newPermissions).forEach(category => {
        Object.keys(newPermissions[category]).forEach(action => {
          newPermissions[category][action] = checked;
        });
      });
      return newPermissions;
    });
  };
  
  // 保存权限设置
  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    
    try {
      const token = getToken();
      
      if (!token) {
        setError('您的会话已过期，请重新登录');
        return;
      }
      
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: selectedUser.id,
          permissions: permissions
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('权限设置已保存');
        await fetchUsers(); // 重新加载用户数据
      } else {
        setError(data.error || '保存权限设置失败');
      }
    } catch (error) {
      console.error('保存权限设置时出错:', error);
      setError('保存权限设置失败，请稍后重试');
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
        <h1 className="text-3xl font-bold">角色权限管理</h1>
        <div className="flex space-x-2">
          <Link 
            href="/admin/users" 
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            用户管理
          </Link>
          <Link 
            href="/admin/prompts" 
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            提示词管理
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 用户列表 */}
          <div className="bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">选择用户</h2>
            {users.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {users.map(user => (
                  <div 
                    key={user.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id 
                        ? 'bg-blue-700 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-medium">
                          {user.name?.charAt(0)?.toUpperCase() || 
                           user.username?.charAt(0)?.toUpperCase() || 
                           user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name || user.username}</p>
                        <p className="text-sm text-gray-300">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            user.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'
                          }`}>
                            {user.role === 'admin' ? '管理员' : '普通用户'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">暂无用户数据</p>
            )}
          </div>
          
          {/* 权限管理 */}
          <div className="bg-gray-800 rounded-lg shadow-md p-4 md:col-span-2">
            {selectedUser ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {selectedUser.name || selectedUser.username}的权限设置
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAllPermissionsToggle(true)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      全选
                    </button>
                    <button
                      onClick={() => handleAllPermissionsToggle(false)}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                    >
                      取消全选
                    </button>
                    <button
                      onClick={handleSavePermissions}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      保存设置
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* 提示词相关权限 */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">提示词管理</h3>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="prompts-all"
                          className="mr-2"
                          checked={Object.values(permissions.prompts).every(v => v === true)}
                          onChange={(e) => handleCategoryPermissionToggle('prompts', e.target.checked)}
                        />
                        <label htmlFor="prompts-all" className="text-sm">全部允许</label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="prompts-create"
                          checked={permissions.prompts.create}
                          onChange={(e) => handlePermissionChange('prompts', 'create', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="prompts-create">创建提示词</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="prompts-delete"
                          checked={permissions.prompts.delete}
                          onChange={(e) => handlePermissionChange('prompts', 'delete', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="prompts-delete">删除自己的提示词</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="prompts-deleteAny"
                          checked={permissions.prompts.deleteAny}
                          onChange={(e) => handlePermissionChange('prompts', 'deleteAny', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="prompts-deleteAny">删除任何人的提示词</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="prompts-edit"
                          checked={permissions.prompts.edit}
                          onChange={(e) => handlePermissionChange('prompts', 'edit', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="prompts-edit">编辑自己的提示词</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="prompts-editAny"
                          checked={permissions.prompts.editAny}
                          onChange={(e) => handlePermissionChange('prompts', 'editAny', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="prompts-editAny">编辑任何人的提示词</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="prompts-review"
                          checked={permissions.prompts.review}
                          onChange={(e) => handlePermissionChange('prompts', 'review', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="prompts-review">审核提示词</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="prompts-manage"
                          checked={permissions.prompts.manage}
                          onChange={(e) => handlePermissionChange('prompts', 'manage', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="prompts-manage">管理提示词分类</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* 评论相关权限 */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">评论管理</h3>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="comments-all"
                          className="mr-2"
                          checked={Object.values(permissions.comments).every(v => v === true)}
                          onChange={(e) => handleCategoryPermissionToggle('comments', e.target.checked)}
                        />
                        <label htmlFor="comments-all" className="text-sm">全部允许</label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="comments-create"
                          checked={permissions.comments.create}
                          onChange={(e) => handlePermissionChange('comments', 'create', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="comments-create">发表评论</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="comments-delete"
                          checked={permissions.comments.delete}
                          onChange={(e) => handlePermissionChange('comments', 'delete', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="comments-delete">删除自己的评论</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="comments-deleteAny"
                          checked={permissions.comments.deleteAny}
                          onChange={(e) => handlePermissionChange('comments', 'deleteAny', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="comments-deleteAny">删除任何人的评论</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="comments-manage"
                          checked={permissions.comments.manage}
                          onChange={(e) => handlePermissionChange('comments', 'manage', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="comments-manage">管理评论</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* 用户相关权限 */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">用户管理</h3>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="users-all"
                          className="mr-2"
                          checked={Object.values(permissions.users).every(v => v === true)}
                          onChange={(e) => handleCategoryPermissionToggle('users', e.target.checked)}
                        />
                        <label htmlFor="users-all" className="text-sm">全部允许</label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="users-view"
                          checked={permissions.users.view}
                          onChange={(e) => handlePermissionChange('users', 'view', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="users-view">查看用户列表</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="users-delete"
                          checked={permissions.users.delete}
                          onChange={(e) => handlePermissionChange('users', 'delete', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="users-delete">删除用户</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="users-edit"
                          checked={permissions.users.edit}
                          onChange={(e) => handlePermissionChange('users', 'edit', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="users-edit">编辑用户信息</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="users-assign"
                          checked={permissions.users.assign}
                          onChange={(e) => handlePermissionChange('users', 'assign', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="users-assign">分配用户角色</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="users-ban"
                          checked={permissions.users.ban}
                          onChange={(e) => handlePermissionChange('users', 'ban', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="users-ban">禁用用户账号</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* 系统相关权限 */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">系统设置</h3>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="system-all"
                          className="mr-2"
                          checked={Object.values(permissions.system).every(v => v === true)}
                          onChange={(e) => handleCategoryPermissionToggle('system', e.target.checked)}
                        />
                        <label htmlFor="system-all" className="text-sm">全部允许</label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="system-settings"
                          checked={permissions.system.settings}
                          onChange={(e) => handlePermissionChange('system', 'settings', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="system-settings">查看系统设置</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="system-categories"
                          checked={permissions.system.categories}
                          onChange={(e) => handlePermissionChange('system', 'categories', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="system-categories">管理提示词分类</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="system-colors"
                          checked={permissions.system.colors}
                          onChange={(e) => handlePermissionChange('system', 'colors', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="system-colors">管理角色和权限</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="system-analytics"
                          checked={permissions.system.analytics}
                          onChange={(e) => handlePermissionChange('system', 'analytics', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="system-analytics">查看数据分析</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="system-logs"
                          checked={permissions.system.logs}
                          onChange={(e) => handlePermissionChange('system', 'logs', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="system-logs">查看系统日志</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleSavePermissions}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      保存设置
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <p className="text-gray-400">请从左侧选择一个用户来管理权限</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}