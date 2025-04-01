"use client";

import { useState, useEffect } from 'react';
import CategoryCard from '../components/CategoryCard';

// 定义分类和模型的数据类型
interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  promptCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryDisplay {
  id: number;
  name: string;
  slug: string;
  icon: string;
  count: number;
}

interface Model {
  id: number;
  name: string;
  slug: string;
  icon: string;
  count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 图标映射
  const iconMap: {[key: string]: string} = {
    'problem-solving': '🧩',
    'creative': '💡',
    'learning': '📚',
    'productivity': '⚡',
    'decision': '🧠',
    'templates': '📋'
  };

  // 从后端API获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (data.success) {
          // 将后端数据转换为前端显示格式
          const formattedCategories = data.categories.map((cat: Category) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: iconMap[cat.slug] || '📁',
            count: cat.promptCount
          }));
          
          setCategories(formattedCategories);
        } else {
          setError(data.error || '获取分类失败');
        }
      } catch (err) {
        console.error('获取分类数据失败:', err);
        setError('获取分类数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 模型数据暂时保持静态
  const models: Model[] = [
    { id: 1, name: 'ChatGPT', slug: 'chatgpt', icon: '🤖', count: 245 },
    { id: 2, name: 'Midjourney', slug: 'midjourney', icon: '🎨', count: 127 },
    { id: 3, name: 'DALL-E', slug: 'dalle', icon: '🖼️', count: 89 },
    { id: 4, name: 'Stable Diffusion', slug: 'stable-diffusion', icon: '🌈', count: 76 },
    { id: 5, name: 'Claude', slug: 'claude', icon: '🧠', count: 63 },
    { id: 6, name: '通用模型', slug: 'general', icon: '📱', count: 112 },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center">
        <div className="animate-spin h-8 w-8 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        <p className="mt-4">加载分类数据中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">按用途分类浏览</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            id={category.id}
            name={category.name}
            slug={category.slug}
            icon={category.icon}
            count={category.count}
          />
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-16 mb-8 text-center">按AI模型分类</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {models.map((model) => (
          <div key={model.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center text-blue-600">
              <span className="text-xl">{model.icon || '🤖'}</span>
            </div>
            <h3 className="font-medium">{model.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{model.count}个提示词</p>
          </div>
        ))}
      </div>
    </div>
  );
} 