"use client";

import { useState } from 'react';
import Link from 'next/link';

// 图表组件（模拟）
const Chart = ({ title, type, height = 300 }: { title: string, type: 'line' | 'bar' | 'pie' | 'area', height?: number }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className={`flex items-center justify-center bg-gray-50 rounded`} style={{ height: `${height}px` }}>
        <div className="text-center">
          <p className="text-gray-500">此处将显示{
            type === 'line' ? '折线图' : 
            type === 'bar' ? '柱状图' : 
            type === 'pie' ? '饼图' : 
            '面积图'
          }</p>
          <p className="text-gray-400 text-sm mt-2">实际项目中将集成ECharts或Chart.js等图表库</p>
        </div>
      </div>
    </div>
  );
};

// 统计卡片组件
const StatCard = ({ title, value, change, icon, color = 'blue' }: { 
  title: string, 
  value: string, 
  change: string, 
  icon: React.ReactNode,
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
}) => {
  const isPositive = !change.includes('-');
  
  const bgColors = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    yellow: 'bg-yellow-100',
    red: 'bg-red-100'
  };
  
  const textColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600'
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className={`text-sm mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change} {isPositive ? '↑' : '↓'} <span className="text-gray-500">较上月</span>
          </p>
        </div>
        <div className={`${bgColors[color]} p-3 rounded-lg`}>
          <span className={`${textColors[color]} text-xl`}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);
  
  // 模拟统计数据
  const stats = [
    {
      title: "总用户数",
      value: "2,845",
      change: "+12.5%",
      icon: "👥",
      color: "blue" as const
    },
    {
      title: "提示词总数",
      value: "1,253",
      change: "+8.2%",
      icon: "📝",
      color: "green" as const
    },
    {
      title: "本月浏览量",
      value: "45,678",
      change: "+24.3%",
      icon: "👁️",
      color: "purple" as const
    },
    {
      title: "平均停留时间",
      value: "4分32秒",
      change: "+5.7%",
      icon: "⏱️",
      color: "yellow" as const
    }
  ];

  // 模拟热门提示词数据
  const popularPrompts = [
    { name: "专业邮件撰写助手", views: 2345, category: "效率提升型" },
    { name: "科幻风格人物肖像", views: 1987, category: "创意生成型" },
    { name: "代码重构与优化", views: 1756, category: "解决问题型" },
    { name: "学习计划生成器", views: 1543, category: "知识学习型" },
    { name: "数据可视化助手", views: 1432, category: "效率提升型" }
  ];

  // 模拟热门搜索关键词
  const popularKeywords = [
    { keyword: "ChatGPT提示词", count: 356 },
    { keyword: "AI绘画", count: 289 },
    { keyword: "效率提升", count: 245 },
    { keyword: "代码生成", count: 198 },
    { keyword: "学习辅助", count: 176 }
  ];

  // 模拟用户地理分布
  const userLocations = [
    { location: "北京", percentage: 22 },
    { location: "上海", percentage: 18 },
    { location: "广州", percentage: 12 },
    { location: "深圳", percentage: 10 },
    { location: "杭州", percentage: 8 },
    { location: "其他", percentage: 30 }
  ];

  // 处理时间范围变更
  const handleTimeRangeChange = (range: 'today' | 'week' | 'month' | 'year') => {
    setIsLoading(true);
    setTimeRange(range);
    
    // 模拟加载数据
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // 导出数据
  const handleExportData = (format: 'csv' | 'excel' | 'pdf') => {
    alert(`数据将以${format.toUpperCase()}格式导出`);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">数据分析</h1>
          <p className="text-gray-600">查看网站的统计数据和趋势</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => handleTimeRangeChange('today')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                timeRange === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              今日
            </button>
            <button
              onClick={() => handleTimeRangeChange('week')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              本周
            </button>
            <button
              onClick={() => handleTimeRangeChange('month')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              本月
            </button>
            <button
              onClick={() => handleTimeRangeChange('year')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                timeRange === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              全年
            </button>
          </div>
          
          <div className="relative">
            <button
              className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
              onClick={() => {
                const dropdown = document.getElementById('export-dropdown');
                if (dropdown) {
                  dropdown.classList.toggle('hidden');
                }
              }}
            >
              导出数据
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div id="export-dropdown" className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExportData('csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  导出为CSV
                </button>
                <button
                  onClick={() => handleExportData('excel')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  导出为Excel
                </button>
                <button
                  onClick={() => handleExportData('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  导出为PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>

          {/* 主要图表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Chart 
              title="用户增长趋势" 
              type="line" 
            />
            <Chart 
              title="访问量统计" 
              type="area" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Chart 
              title="提示词分类分布" 
              type="pie" 
            />
            <Chart 
              title="每日活跃用户" 
              type="bar" 
            />
          </div>

          {/* 详细数据 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-medium">热门提示词</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {popularPrompts.map((prompt, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <div className="ml-4">
                          <p className="font-medium">{prompt.name}</p>
                          <p className="text-sm text-gray-500">{prompt.category}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {prompt.views.toLocaleString()} 浏览
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-medium">热门搜索关键词</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {popularKeywords.map((keyword, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{keyword.keyword}</span>
                          <span className="text-sm text-gray-500">{keyword.count} 次</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(keyword.count / popularKeywords[0].count) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-medium">用户地理分布</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {userLocations.map((location, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{location.location}</span>
                          <span className="text-sm text-gray-500">{location.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${location.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 