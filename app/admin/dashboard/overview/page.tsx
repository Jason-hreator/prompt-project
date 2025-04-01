"use client";

import { useState } from 'react';
import Link from 'next/link';

// 概览卡片组件
const OverviewCard = ({ title, value, description, icon, color = 'blue' }: { 
  title: string, 
  value: string, 
  description: string, 
  icon: React.ReactNode,
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo'
}) => {
  const bgColors = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    yellow: 'bg-yellow-100',
    red: 'bg-red-100',
    indigo: 'bg-indigo-100'
  };
  
  const textColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600'
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-sm mt-2 text-gray-500">{description}</p>
        </div>
        <div className={`${bgColors[color]} p-3 rounded-lg`}>
          <span className={`${textColors[color]} text-xl`}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

// 趋势图表组件（模拟）
const TrendChart = ({ title, description, type }: { title: string, description: string, type: 'line' | 'bar' | 'area' }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
        <div className="text-center">
          <p className="text-gray-500">此处将显示{
            type === 'line' ? '折线图' : 
            type === 'bar' ? '柱状图' : 
            '面积图'
          }</p>
          <p className="text-gray-400 text-sm mt-2">实际项目中将集成ECharts或Chart.js等图表库</p>
        </div>
      </div>
    </div>
  );
};

// 平台健康状态组件
const HealthStatus = ({ status }: { status: 'good' | 'warning' | 'critical' }) => {
  const statusConfig = {
    good: {
      color: 'bg-green-500',
      text: '良好',
      description: '所有系统正常运行'
    },
    warning: {
      color: 'bg-yellow-500',
      text: '注意',
      description: '部分系统性能下降'
    },
    critical: {
      color: 'bg-red-500',
      text: '警告',
      description: '系统存在严重问题'
    }
  };
  
  const config = statusConfig[status];
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-2">平台健康状态</h3>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
        <span className="ml-2 font-medium">{config.text}</span>
      </div>
      <p className="text-sm text-gray-500 mt-2">{config.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm font-medium">服务器负载</p>
          <p className="text-lg font-bold mt-1">32%</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm font-medium">响应时间</p>
          <p className="text-lg font-bold mt-1">187ms</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm font-medium">内存使用</p>
          <p className="text-lg font-bold mt-1">2.4GB</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm font-medium">存储空间</p>
          <p className="text-lg font-bold mt-1">45%</p>
        </div>
      </div>
    </div>
  );
};

export default function DataOverviewPage() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  
  // 处理时间范围变更
  const handleTimeRangeChange = (range: 'today' | 'week' | 'month' | 'year') => {
    setTimeRange(range);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">数据概览</h1>
          <p className="text-gray-600">平台关键指标和趋势分析</p>
        </div>
        <div className="mt-4 sm:mt-0">
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
        </div>
      </div>

      {/* 关键指标概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <OverviewCard 
          title="活跃用户" 
          value="1,245" 
          description="较上月增长 12.5%" 
          icon="👥" 
          color="blue" 
        />
        <OverviewCard 
          title="新增提示词" 
          value="328" 
          description="较上月增长 8.2%" 
          icon="📝" 
          color="green" 
        />
        <OverviewCard 
          title="转化率" 
          value="5.8%" 
          description="较上月提升 0.7%" 
          icon="📈" 
          color="purple" 
        />
        <OverviewCard 
          title="平均会话时长" 
          value="4分32秒" 
          description="较上月增长 5.7%" 
          icon="⏱️" 
          color="yellow" 
        />
        <OverviewCard 
          title="跳出率" 
          value="32.4%" 
          description="较上月下降 2.1%" 
          icon="↩️" 
          color="red" 
        />
        <OverviewCard 
          title="收入" 
          value="¥12,580" 
          description="较上月增长 15.3%" 
          icon="💰" 
          color="indigo" 
        />
      </div>

      {/* 趋势图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TrendChart 
          title="用户增长趋势" 
          description="过去30天新注册用户和活跃用户数量变化" 
          type="line" 
        />
        <TrendChart 
          title="内容创作趋势" 
          description="过去30天新增提示词和评论数量变化" 
          type="area" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <TrendChart 
            title="流量来源分布" 
            description="用户访问来源渠道占比" 
            type="bar" 
          />
        </div>
        <HealthStatus status="good" />
      </div>

      {/* 数据洞察 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">数据洞察</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <h4 className="font-medium text-blue-700">用户活跃度提升</h4>
            <p className="text-sm text-blue-600 mt-1">日活跃用户数量较上月增长了12.5%，这可能与最近推出的新功能有关。</p>
          </div>
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <h4 className="font-medium text-green-700">内容创作高峰</h4>
            <p className="text-sm text-green-600 mt-1">周二和周四是用户创建提示词最活跃的时间，建议在这些时间推送创作激励。</p>
          </div>
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <h4 className="font-medium text-yellow-700">移动端体验需优化</h4>
            <p className="text-sm text-yellow-600 mt-1">移动端用户的跳出率比桌面端高出15%，建议优化移动端用户体验。</p>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/analytics" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <span className="text-blue-600 text-xl mr-3">📊</span>
            <div>
              <p className="font-medium">查看详细分析</p>
              <p className="text-sm text-gray-500">深入了解用户行为和平台数据</p>
            </div>
          </Link>
          <Link href="/admin/settings" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <span className="text-green-600 text-xl mr-3">⚙️</span>
            <div>
              <p className="font-medium">调整系统设置</p>
              <p className="text-sm text-gray-500">优化网站配置和功能</p>
            </div>
          </Link>
          <Link href="/admin/prompts" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <span className="text-purple-600 text-xl mr-3">📝</span>
            <div>
              <p className="font-medium">管理内容</p>
              <p className="text-sm text-gray-500">审核和管理平台提示词</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 