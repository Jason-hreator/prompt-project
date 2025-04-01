"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 图表组件（模拟）
const Chart = ({ title, type, data }: { title: string, type: 'line' | 'bar' | 'pie', data: any }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
        <p className="text-gray-500">此处将显示{type === 'line' ? '折线图' : type === 'bar' ? '柱状图' : '饼图'}</p>
      </div>
    </div>
  );
};

// 统计卡片组件
const StatCard = ({ title, value, change, icon }: { title: string, value: string, change: string, icon: string }) => {
  const isPositive = !change.includes('-');
  
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
        <div className="bg-blue-100 p-3 rounded-lg">
          <span className="text-blue-600 text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

// 活动项组件
const ActivityItem = ({ 
  type, 
  content, 
  user, 
  time, 
  status 
}: { 
  type: 'prompt' | 'user' | 'comment', 
  content: string, 
  user: string, 
  time: string,
  status?: 'pending' | 'approved' | 'rejected'
}) => {
  return (
    <div className="border-b border-gray-100 py-3 last:border-0">
      <div className="flex items-start">
        <div className={`rounded-full w-8 h-8 flex items-center justify-center text-white ${
          type === 'prompt' ? 'bg-blue-500' : 
          type === 'user' ? 'bg-green-500' : 
          'bg-purple-500'
        }`}>
          {type === 'prompt' ? '📝' : type === 'user' ? '👤' : '💬'}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm">
            <span className="font-medium">{user}</span> {
              type === 'prompt' ? '提交了新提示词' : 
              type === 'user' ? '注册了账号' : 
              '发表了评论'
            }
          </p>
          <p className="text-sm text-gray-600 mt-1">{content}</p>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">{time}</span>
            {status && (
              <span className={`text-xs px-2 py-1 rounded ${
                status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                status === 'approved' ? 'bg-green-100 text-green-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {status === 'pending' ? '待审核' : 
                 status === 'approved' ? '已批准' : 
                 '已拒绝'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // 模拟加载数据
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">管理员仪表盘</h1>
        <p className="text-gray-600">网站概览和最近活动</p>
      </div>

      {/* 时间范围选择器 */}
      <div className="mb-6 flex justify-end">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              timeRange === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            今日
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 text-sm font-medium ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            本周
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 text-sm font-medium ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            本月
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              timeRange === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            全年
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="总用户数" 
          value="2,845" 
          change="+12.5%" 
          icon="👥" 
        />
        <StatCard 
          title="提示词总数" 
          value="1,253" 
          change="+8.2%" 
          icon="📝" 
        />
        <StatCard 
          title="本月浏览量" 
          value="45,678" 
          change="+24.3%" 
          icon="👁️" 
        />
        <StatCard 
          title="待审核内容" 
          value="28" 
          change="-3.1%" 
          icon="⏳" 
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Chart 
          title="用户增长趋势" 
          type="line" 
          data={{}} 
        />
        <div className="bg-white rounded-lg shadow-sm p-4 h-full">
          <h3 className="text-lg font-medium mb-2">提示词分类分布</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full grid grid-cols-2 gap-4 p-2">
              {/* 模拟饼图的分类显示 */}
              <div className="flex items-center p-2 rounded-md bg-blue-50">
                <div className="bg-blue-500 text-white p-2 rounded-md mr-2">
                  <span className="text-sm">解决问题型</span>
                </div>
                <div>
                  <p className="text-sm font-medium">35%</p>
                  <p className="text-xs text-gray-500">152 个提示词</p>
                </div>
              </div>
              
              <div className="flex items-center p-2 rounded-md bg-green-50">
                <div className="bg-green-500 text-white p-2 rounded-md mr-2">
                  <span className="text-sm">创意生成型</span>
                </div>
                <div>
                  <p className="text-sm font-medium">21%</p>
                  <p className="text-xs text-gray-500">89 个提示词</p>
                </div>
              </div>
              
              <div className="flex items-center p-2 rounded-md bg-purple-50">
                <div className="bg-purple-500 text-white p-2 rounded-md mr-2">
                  <span className="text-sm">知识学习型</span>
                </div>
                <div>
                  <p className="text-sm font-medium">18%</p>
                  <p className="text-xs text-gray-500">76 个提示词</p>
                </div>
              </div>
              
              <div className="flex items-center p-2 rounded-md bg-yellow-50">
                <div className="bg-yellow-500 text-white p-2 rounded-md mr-2">
                  <span className="text-sm">效率提升型</span>
                </div>
                <div>
                  <p className="text-sm font-medium">26%</p>
                  <p className="text-xs text-gray-500">113 个提示词</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-medium">最近活动</h3>
            <Link href="/admin/activity" className="text-sm text-blue-600 hover:underline">
              查看全部
            </Link>
          </div>
          <div className="p-6">
            <ActivityItem 
              type="prompt" 
              content="专业邮件撰写助手" 
              user="张明" 
              time="10分钟前"
              status="pending"
            />
            <ActivityItem 
              type="user" 
              content="新用户注册" 
              user="李华" 
              time="30分钟前"
            />
            <ActivityItem 
              type="comment" 
              content="这个提示词非常实用，帮我节省了很多时间！" 
              user="王芳" 
              time="1小时前"
            />
            <ActivityItem 
              type="prompt" 
              content="科幻风格人物肖像" 
              user="赵伟" 
              time="2小时前"
              status="approved"
            />
            <ActivityItem 
              type="prompt" 
              content="数据可视化助手" 
              user="刘强" 
              time="3小时前"
              status="rejected"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-medium">热门提示词</h3>
            <Link href="/admin/prompts" className="text-sm text-blue-600 hover:underline">
              查看全部
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <Link href="/admin/prompts/1" className="font-medium hover:text-blue-600">
                    专业邮件撰写助手
                  </Link>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="mr-3">👁️ 2,345</span>
                    <span className="mr-3">❤️ 187</span>
                    <span>💬 32</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  ChatGPT
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1">
                  <Link href="/admin/prompts/2" className="font-medium hover:text-blue-600">
                    科幻风格人物肖像
                  </Link>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="mr-3">👁️ 1,987</span>
                    <span className="mr-3">❤️ 156</span>
                    <span>💬 28</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Midjourney
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1">
                  <Link href="/admin/prompts/3" className="font-medium hover:text-blue-600">
                    代码重构助手
                  </Link>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="mr-3">👁️ 1,756</span>
                    <span className="mr-3">❤️ 143</span>
                    <span>💬 25</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Claude
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1">
                  <Link href="/admin/prompts/4" className="font-medium hover:text-blue-600">
                    数据可视化助手
                  </Link>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="mr-3">👁️ 1,543</span>
                    <span className="mr-3">❤️ 128</span>
                    <span>💬 22</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  ChatGPT
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1">
                  <Link href="/admin/prompts/5" className="font-medium hover:text-blue-600">
                    学习计划生成器
                  </Link>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="mr-3">👁️ 1,432</span>
                    <span className="mr-3">❤️ 119</span>
                    <span>💬 20</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Gemini
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作区域 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-medium">快速操作</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/admin/prompts/batch-upload"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <span className="text-blue-600 text-xl">📤</span>
              </div>
              <div>
                <h4 className="font-medium">批量上传提示词</h4>
                <p className="text-sm text-gray-500 mt-1">通过CSV或JSON文件批量导入</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/users/new"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <span className="text-green-600 text-xl">👤</span>
              </div>
              <div>
                <h4 className="font-medium">添加新用户</h4>
                <p className="text-sm text-gray-500 mt-1">创建新的用户账号</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/prompts?status=pending"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
              <div>
                <h4 className="font-medium">审核待处理提示词</h4>
                <p className="text-sm text-gray-500 mt-1">查看并处理待审核的提示词</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 