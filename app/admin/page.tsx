"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getToken } from '@/lib/auth';

// 定义数据类型
interface DashboardData {
  stats: {
    totalPrompts: number;
    totalUsers: number;
    dailyVisits: number;
    pendingReviews: number;
  };
  categoryDistribution: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  recentActivities: Array<{
    id: string;
    title: string;
    description: string;
    time: string;
    type: string;
  }>;
}

// 仪表盘卡片组件
function DashboardCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

// 活动项组件
function ActivityItem({ title, description, time, icon }: { title: string; description: string; time: string; icon: React.ReactNode }) {
  return (
    <div className="flex mb-4">
      <div className="flex-shrink-0 mr-3">
        <div className="mt-1 rounded-full p-2 bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}

// 管理面板页面组件
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          setDashboardData(result.data);
        } else {
          setError(result.error || '获取仪表盘数据失败');
        }
      } catch (err) {
        console.error('获取仪表盘数据失败:', err);
        setError('获取仪表盘数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
        <Link 
          href="/"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          返回首页
        </Link>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>没有可用的仪表盘数据</p>
        </div>
        <Link 
          href="/"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          返回首页
        </Link>
      </div>
    );
  }

  // 统计数据
  const stats = [
    {
      title: "总提示词数",
      value: dashboardData.stats.totalPrompts,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
    {
      title: "注册用户",
      value: dashboardData.stats.totalUsers,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: "今日访问量",
      value: dashboardData.stats.dailyVisits,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "待审核",
      value: dashboardData.stats.pendingReviews,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ];

  // 最近活动数据处理
  const recentActivities = dashboardData.recentActivities.map(activity => {
    let icon;
    
    // 根据活动类型设置图标
    switch(activity.type) {
      case "new_prompt":
        icon = (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
        break;
      case "user_register":
        icon = (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
        break;
      case "prompt_reported":
        icon = (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
        break;
      case "system_update":
        icon = (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
        break;
      case "prompt_approved":
        icon = (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
        break;
      case "prompt_rejected":
        icon = (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
        break;
      default:
        icon = (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
    
    return {
      title: activity.title,
      description: activity.description,
      time: activity.time,
      icon: icon
    };
  });

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="container p-6 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">管理仪表盘</h1>
          <p className="text-gray-600 dark:text-gray-400">平台概况与最近动态</p>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <DashboardCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 快速链接 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">快速访问</h2>
            <div className="space-y-3">
              <Link 
                href="/admin/prompts"
                className="flex items-center p-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                提示词管理
              </Link>
              <Link 
                href="/admin/users"
                className="flex items-center p-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                用户管理
              </Link>
              <Link 
                href="/admin/analytics"
                className="flex items-center p-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                数据分析
              </Link>
              <Link 
                href="/admin/logs"
                className="flex items-center p-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                操作日志
              </Link>
              <Link 
                href="/admin/categories"
                className="flex items-center p-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                分类管理
              </Link>
              <Link 
                href="/admin/settings"
                className="flex items-center p-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                系统设置
              </Link>
            </div>
          </div>
          
          {/* 最近活动 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">最近活动</h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <ActivityItem 
                  key={index}
                  title={activity.title}
                  description={activity.description}
                  time={activity.time}
                  icon={activity.icon}
                />
              ))}
            </div>
            <div className="mt-4">
              <Link 
                href="/admin/logs"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                查看所有活动 &rarr;
              </Link>
            </div>
          </div>
          
          {/* 分类分布 */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">提示词分类分布</h2>
            <div className="max-w-full overflow-hidden">
              {dashboardData?.categoryDistribution?.map((category, index) => (
                <div key={index} className="flex items-center mb-2">
                  <div className="text-gray-400 min-w-[30px] text-center mr-2">
                    {index + 1}
                  </div>
                  <div className="w-full">
                    <div className="flex items-center mb-1">
                      <div className="truncate" style={{ maxWidth: '60%' }}>
                        {category.name}
                      </div>
                      <div className="ml-auto text-gray-400">
                        {category.count} ({category.percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 