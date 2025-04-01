"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getToken } from '@/lib/auth';

// 分类数据类型
interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  promptCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // 获取分类列表
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '获取分类列表失败');
      }
      
      if (data.success) {
        setCategories(data.data);
      } else {
        throw new Error(data.error || '获取分类列表失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取分类列表失败');
      console.error('获取分类列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 筛选分类
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 自动生成slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, ''),
    });
  };

  // 打开添加分类模态框
  const openAddModal = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
    });
    setIsAddModalOpen(true);
  };

  // 打开编辑分类模态框
  const openEditModal = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
    });
    setIsEditModalOpen(true);
  };

  // 关闭模态框
  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setCurrentCategory(null);
    setError(null);
  };

  // 添加分类
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const token = getToken();
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '添加分类失败');
      }
      
      if (data.success) {
        setCategories([...categories, data.data]);
        closeModals();
      } else {
        throw new Error(data.error || '添加分类失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加分类失败');
      console.error('添加分类失败:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 更新分类
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCategory) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const token = getToken();
      const response = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: currentCategory.id,
          ...formData,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '更新分类失败');
      }
      
      if (data.success) {
        setCategories(categories.map(category => 
          category.id === currentCategory.id ? data.data : category
        ));
        closeModals();
      } else {
        throw new Error(data.error || '更新分类失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新分类失败');
      console.error('更新分类失败:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 删除分类
  const handleDeleteCategory = async (id: number) => {
    if (!confirm('确定要删除这个分类吗？此操作无法撤销。')) return;
    
    try {
      setError(null);
      
      const token = getToken();
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '删除分类失败');
      }
      
      if (data.success) {
        setCategories(categories.filter(category => category.id !== id));
      } else {
        throw new Error(data.error || '删除分类失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除分类失败');
      console.error('删除分类失败:', err);
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">分类管理</h1>
          <p className="text-gray-600">管理提示词分类</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            添加分类
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="搜索分类..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分类名称
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    描述
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    提示词数量
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建日期
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">{category.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{category.promptCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{category.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500">没有找到匹配的分类</p>
            </div>
          )}
        </div>
      </div>

      {/* 添加分类模态框 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">添加分类</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleAddCategory}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    分类名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">用于URL的唯一标识符，只能包含小写字母、数字和连字符</p>
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModals}
                    disabled={submitting}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? '添加中...' : '添加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 编辑分类模态框 */}
      {isEditModalOpen && currentCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">编辑分类</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleUpdateCategory}>
                <div className="mb-4">
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                    分类名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="edit-slug" className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">用于URL的唯一标识符，只能包含小写字母、数字和连字符</p>
                </div>
                <div className="mb-4">
                  <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModals}
                    disabled={submitting}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? '保存中...' : '保存'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 