"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getCategories } from "../lib/api";
import FeaturedPrompts from './components/FeaturedPrompts';

export default function Home() {
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
  const [isModelExpanded, setIsModelExpanded] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeModel, setActiveModel] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 获取分类数据
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        setError('获取数据失败');
        console.error('获取数据失败:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const toggleCategory = () => {
    setIsCategoryExpanded(!isCategoryExpanded);
  };

  const toggleModel = () => {
    setIsModelExpanded(!isModelExpanded);
  };
  
  // 获取模型颜色样式
  const getModelBadgeClass = (model) => {
    const modelColors = {
      'GPT-4': 'bg-green-600 text-white',
      'GPT-3.5': 'bg-blue-600 text-white',
      'Claude': 'bg-purple-600 text-white',
      'Gemini': 'bg-indigo-600 text-white',
      'Llama': 'bg-red-600 text-white',
      '通用': 'bg-gray-600 text-white'
    };
    
    return modelColors[model] || 'bg-gray-600 text-white';
  };

  return (
    <div className="animate-fadeIn">
      {/* 英雄区域 */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-16 md:py-24">
        <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center">
          <div className="md:w-1/2 mt-8 md:mt-0 md:pr-8">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">分享和发现</span>
              <br />高质量AI提示词
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              提示精灵是一个帮助用户创建、分享和使用高质量AI提示词的平台，释放人工智能的真正潜力。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link 
                href="/prompts" 
                className="btn-primary flex items-center justify-center"
              >
                探索提示词
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link 
                href="/register" 
                className="btn-outline"
              >
                创建账号
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src="/images/hero-illustration.svg"
                alt="AI提示词"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 精选提示词 */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">精选提示词</h2>
            <p className="mt-2 text-gray-400">发现由社区精心挑选的高质量提示词</p>
          </div>
          <FeaturedPrompts />
          <div className="mt-12 text-center">
            <Link 
              href="/prompts" 
              className="btn-secondary inline-flex items-center"
            >
              查看所有提示词
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 功能区域 */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">为什么选择提示精灵？</h2>
            <p className="mt-2 text-gray-400">我们的平台为您提供探索和使用AI提示词的独特体验</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">高质量提示词</h3>
              <p className="text-gray-400">
                精心挑选和验证的提示词库，确保每个提示词都能产生优质输出。
              </p>
            </div>
            <div className="card p-6">
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">活跃社区</h3>
              <p className="text-gray-400">
                加入充满创意的社区，与其他AI爱好者分享经验和灵感。
              </p>
            </div>
            <div className="card p-6">
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">一键使用</h3>
              <p className="text-gray-400">
                轻松复制并使用提示词，无需复杂设置，立即提升您的AI交互体验。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 号召行动 */}
      <section className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">准备好开始您的AI提示词之旅了吗？</h2>
          <p className="text-lg text-gray-300 mb-8">
            加入我们的社区，创建、分享和发现能够释放AI真正潜力的提示词。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary">
              立即注册
            </Link>
            <Link href="/about" className="btn-outline">
              了解更多
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
