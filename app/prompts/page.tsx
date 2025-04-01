"use client";

import { useState, useEffect } from 'react';
import PromptCard from '../components/PromptCard';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PromptsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // 筛选条件状态
  const [sortBy, setSortBy] = useState('newest');
  const [category, setCategory] = useState('');
  const [model, setModel] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(9);
  
  // 分类数据
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // 初始化筛选条件
  useEffect(() => {
    const queryCategory = searchParams.get('category');
    const queryModel = searchParams.get('model');
    const querySort = searchParams.get('sort');
    const queryPage = searchParams.get('page');
    
    if (queryCategory) {
      setCategory(queryCategory);
    }
    
    if (queryModel) {
      setModel(queryModel);
    }
    
    if (querySort) {
      setSortBy(querySort);
    }
    
    if (queryPage) {
      const pageNum = parseInt(queryPage);
      if (!isNaN(pageNum) && pageNum > 0) {
        setPage(pageNum);
      }
    }
  }, [searchParams]);
  
  // 获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error(`请求失败: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.data || []);
          console.log('获取分类成功:', data.data);
        } else {
          console.error('获取分类失败:', data.error);
          setCategories([]);
        }
      } catch (err) {
        console.error('获取分类出错:', err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // 从API获取提示词数据
  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      setError(""); // 清除之前的错误
      
      try {
        // 构建查询参数
        const queryParams = new URLSearchParams();
        if (category) queryParams.append('category', category);
        if (model) queryParams.append('model', model);
        if (sortBy) queryParams.append('sort', sortBy);
        queryParams.append('page', page.toString());
        queryParams.append('limit', itemsPerPage.toString());
        
        console.log('正在获取提示词数据，请求参数:', queryParams.toString());
        
        const response = await fetch(`/api/prompts?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`请求失败: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          console.log('获取提示词成功，数据:', data);
          
          // 兼容两种数据格式：data.prompts 或 data.data
          const promptsData = data.prompts || data.data || [];
          setPrompts(promptsData);
          setTotalPages(Math.ceil(data.total / itemsPerPage) || 1);
        } else {
          console.error('获取提示词返回错误:', data.error);
          setError(data.error || "获取提示词失败");
          setPrompts([]);
        }
      } catch (err) {
        console.error("获取提示词失败:", err);
        setError("获取提示词时发生错误：" + (err instanceof Error ? err.message : String(err)));
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrompts();
  }, [category, model, sortBy, page, itemsPerPage]);
  
  // 处理筛选条件变化
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1); // 重置页码
  };
  
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1); // 重置页码
  };
  
  const handleModelChange = (e) => {
    setModel(e.target.value);
    setPage(1); // 重置页码
  };
  
  // 处理分页
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  
  // 生成分页按钮
  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        buttons.push(
          <button
            key={i}
            className={`px-3 py-1 border border-gray-700 ${
              page === i 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      } else if (i === page - 2 || i === page + 2) {
        buttons.push(
          <span key={i} className="px-3 py-1 border-t border-b border-gray-700 bg-gray-800 text-gray-400">
            ...
          </span>
        );
      }
    }
    return buttons;
  };
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">所有提示词</h1>
      
      {/* 筛选器 */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-10 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-200">控制面板</h3>
          <select 
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="popular">热门排序</option>
            <option value="newest">最新排序</option>
            <option value="oldest">最早发布</option>
          </select>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="font-medium mb-3 text-gray-200">实验参数</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">提示词分类</label>
              <select 
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                value={category}
                onChange={handleCategoryChange}
                disabled={loadingCategories}
              >
                <option value="">全部分类</option>
                {loadingCategories ? (
                  <option value="" disabled>加载中...</option>
                ) : (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">AI模型</label>
              <select 
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                value={model}
                onChange={handleModelChange}
              >
                <option value="">全部模型</option>
                <option value="ChatGPT">ChatGPT</option>
                <option value="Midjourney">Midjourney</option>
                <option value="DALL-E">DALL-E</option>
                <option value="Stable Diffusion">Stable Diffusion</option>
                <option value="Claude">Claude</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">加载中...</p>
        </div>
      )}
      
      {/* 错误消息 */}
      {error && !loading && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
          <p className="font-medium mb-2">获取数据出错</p>
          <p>{error}</p>
          <button 
            onClick={() => {
              setLoading(true);
              setError("");
              // 重新触发获取数据
              const currentPage = page;
              setPage(0);
              setTimeout(() => setPage(currentPage), 100);
            }}
            className="mt-3 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md text-sm"
          >
            重试
          </button>
        </div>
      )}
      
      {/* 提示词列表 */}
      {!loading && !error && (!prompts || prompts.length === 0) && (
        <div className="text-center py-10 bg-gray-800 border border-gray-700 rounded-lg">
          <p className="text-gray-400">没有找到符合条件的提示词</p>
        </div>
      )}
      
      {!loading && !error && prompts && prompts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              id={prompt.id}
              title={prompt.title}
              description={prompt.description || ''}
              model={prompt.model}
              modelColor={getModelColor(prompt.model)}
              likes={prompt.likes || 0}
              comments={(prompt.comments && prompt.comments.length) || 0}
              author={
                typeof prompt.author === 'object' 
                  ? prompt.author.name 
                  : (prompt.author || '未知作者')
              }
            />
          ))}
        </div>
      )}
      
      {/* 分页 */}
      {!loading && !error && prompts && prompts.length > 0 && (
        <div className="flex justify-center mt-12">
          <div className="flex rounded-md">
            <button
              className="px-3 py-1 border border-gray-700 rounded-l-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              上一页
            </button>
            
            {renderPaginationButtons().map((button, index) => (
              <div key={index}>{button}</div>
            ))}
            
            <button
              className="px-3 py-1 border border-gray-700 rounded-r-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 获取模型对应的颜色
function getModelColor(model) {
  const modelColors = {
    'ChatGPT': 'bg-green-100 text-green-800',
    'Midjourney': 'bg-blue-100 text-blue-800',
    'DALL-E': 'bg-purple-100 text-purple-800',
    'Stable Diffusion': 'bg-orange-100 text-orange-800',
    'Claude': 'bg-indigo-100 text-indigo-800',
  };
  
  return modelColors[model] || 'bg-gray-100 text-gray-800';
}

// 示例数据
const prompts = [
  {
    id: 1,
    title: '专业邮件撰写助手',
    description: '输入主题和关键点，生成专业的商业邮件，适合各种职场场景。',
    model: 'ChatGPT',
    modelColor: 'bg-green-100 text-green-800',
    likes: 458,
    comments: 32,
  },
  {
    id: 2,
    title: '科幻风格人物肖像',
    description: '生成具有未来科技感的人物肖像，包含详细的光效和背景元素。',
    model: 'Midjourney',
    modelColor: 'bg-blue-100 text-blue-800',
    likes: 352,
    comments: 28,
  },
  {
    id: 3,
    title: '代码重构与优化',
    description: '提供代码片段，获取优化建议和重构版本，适用于多种编程语言。',
    model: 'ChatGPT',
    modelColor: 'bg-green-100 text-green-800',
    likes: 289,
    comments: 41,
  },
  {
    id: 4,
    title: '故事创作灵感生成器',
    description: '根据简短提示生成独特的故事情节、角色背景和场景描述，克服创作瓶颈。',
    model: 'ChatGPT',
    modelColor: 'bg-green-100 text-green-800',
    likes: 245,
    comments: 19,
  },
  {
    id: 5,
    title: '水彩风景画生成器',
    description: '创建逼真的水彩风景画，具有自然的色彩混合和纹理效果。',
    model: 'DALL-E',
    modelColor: 'bg-purple-100 text-purple-800',
    likes: 213,
    comments: 15,
  },
  {
    id: 6,
    title: '产品说明书优化器',
    description: '将技术性产品说明转化为易于理解的用户友好内容，保持信息准确性。',
    model: 'Claude',
    modelColor: 'bg-indigo-100 text-indigo-800',
    likes: 187,
    comments: 23,
  },
]; 