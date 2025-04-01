"use client";

import { useState } from 'react';
import Link from 'next/link';

// 日志类型
type LogType = 'login' | 'operation' | 'security' | 'error' | 'all';

// 日志级别
type LogLevel = 'info' | 'warning' | 'error' | 'critical' | 'all';

// 日志项接口
interface LogItem {
  id: string;
  timestamp: string;
  type: Exclude<LogType, 'all'>;
  level: Exclude<LogLevel, 'all'>;
  user: {
    id: string;
    name: string;
    role: string;
  };
  action: string;
  details: string;
  ip: string;
  userAgent: string;
}

// 安全指标接口
interface SecurityMetric {
  title: string;
  value: string;
  change?: string;
  status: 'good' | 'warning' | 'critical';
}

// 模拟日志数据
const mockLogs: LogItem[] = [
  {
    id: '1',
    timestamp: '2023-06-15T08:30:25Z',
    type: 'login',
    level: 'info',
    user: {
      id: 'user1',
      name: '张明',
      role: '管理员'
    },
    action: '登录成功',
    details: '管理员登录系统',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  {
    id: '2',
    timestamp: '2023-06-15T07:45:12Z',
    type: 'security',
    level: 'warning',
    user: {
      id: 'user2',
      name: '李华',
      role: '用户'
    },
    action: '多次登录失败',
    details: '用户连续5次登录失败，账户暂时锁定15分钟',
    ip: '203.0.113.45',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  },
  {
    id: '3',
    timestamp: '2023-06-14T23:12:36Z',
    type: 'operation',
    level: 'info',
    user: {
      id: 'user3',
      name: '王芳',
      role: '版主'
    },
    action: '内容审核',
    details: '审核并批准了5篇提示词',
    ip: '198.51.100.78',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
  },
  {
    id: '4',
    timestamp: '2023-06-14T18:05:42Z',
    type: 'error',
    level: 'error',
    user: {
      id: 'system',
      name: '系统',
      role: '系统'
    },
    action: '数据库连接错误',
    details: '数据库连接超时，自动重连成功',
    ip: '127.0.0.1',
    userAgent: 'System'
  },
  {
    id: '5',
    timestamp: '2023-06-14T15:30:18Z',
    type: 'security',
    level: 'critical',
    user: {
      id: 'system',
      name: '系统',
      role: '系统'
    },
    action: '检测到异常访问',
    details: '检测到来自IP 45.227.253.214的大量请求，已自动拦截',
    ip: '45.227.253.214',
    userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
  },
  {
    id: '6',
    timestamp: '2023-06-14T12:48:55Z',
    type: 'operation',
    level: 'info',
    user: {
      id: 'user4',
      name: '赵伟',
      role: '管理员'
    },
    action: '系统设置更改',
    details: '更新了网站基本设置',
    ip: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  {
    id: '7',
    timestamp: '2023-06-14T10:15:30Z',
    type: 'login',
    level: 'warning',
    user: {
      id: 'user5',
      name: '刘强',
      role: '用户'
    },
    action: '异地登录',
    details: '检测到非常用地点登录，已发送安全提醒邮件',
    ip: '103.86.50.65',
    userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
  },
  {
    id: '8',
    timestamp: '2023-06-13T22:05:12Z',
    type: 'error',
    level: 'error',
    user: {
      id: 'system',
      name: '系统',
      role: '系统'
    },
    action: 'API调用错误',
    details: '第三方支付API调用失败，错误代码: E4001',
    ip: '127.0.0.1',
    userAgent: 'System'
  },
  {
    id: '9',
    timestamp: '2023-06-13T16:42:38Z',
    type: 'security',
    level: 'info',
    user: {
      id: 'system',
      name: '系统',
      role: '系统'
    },
    action: '安全更新',
    details: '系统安全组件更新完成',
    ip: '127.0.0.1',
    userAgent: 'System'
  },
  {
    id: '10',
    timestamp: '2023-06-13T09:18:25Z',
    type: 'operation',
    level: 'info',
    user: {
      id: 'user6',
      name: '陈静',
      role: '版主'
    },
    action: '用户管理',
    details: '禁用了3个违规用户账号',
    ip: '192.168.1.110',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
];

// 模拟安全指标数据
const securityMetrics: SecurityMetric[] = [
  {
    title: '安全评分',
    value: '92/100',
    change: '+5',
    status: 'good'
  },
  {
    title: '登录失败率',
    value: '2.4%',
    change: '-0.8%',
    status: 'good'
  },
  {
    title: '异常IP访问',
    value: '15',
    change: '+3',
    status: 'warning'
  },
  {
    title: '漏洞数量',
    value: '0',
    change: '0',
    status: 'good'
  }
];

// 级别标签组件
const LevelBadge = ({ level }: { level: Exclude<LogLevel, 'all'> }) => {
  const levelConfig = {
    info: {
      color: 'bg-blue-100 text-blue-800',
      text: '信息'
    },
    warning: {
      color: 'bg-yellow-100 text-yellow-800',
      text: '警告'
    },
    error: {
      color: 'bg-red-100 text-red-800',
      text: '错误'
    },
    critical: {
      color: 'bg-purple-100 text-purple-800',
      text: '严重'
    }
  };
  
  const config = levelConfig[level];
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

// 类型标签组件
const TypeBadge = ({ type }: { type: Exclude<LogType, 'all'> }) => {
  const typeConfig = {
    login: {
      color: 'bg-green-100 text-green-800',
      text: '登录'
    },
    operation: {
      color: 'bg-blue-100 text-blue-800',
      text: '操作'
    },
    security: {
      color: 'bg-yellow-100 text-yellow-800',
      text: '安全'
    },
    error: {
      color: 'bg-red-100 text-red-800',
      text: '错误'
    }
  };
  
  const config = typeConfig[type];
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

// 安全指标卡片组件
const SecurityMetricCard = ({ metric }: { metric: SecurityMetric }) => {
  const statusConfig = {
    good: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-500',
      icon: '✓'
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-500',
      icon: '⚠️'
    },
    critical: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-500',
      icon: '✗'
    }
  };
  
  const config = statusConfig[metric.status];
  
  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{metric.title}</p>
          <p className="text-xl font-bold mt-1">{metric.value}</p>
          {metric.change && (
            <p className={`text-sm mt-1 ${metric.change.startsWith('+') ? 'text-green-600' : metric.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
              {metric.change}
            </p>
          )}
        </div>
        <div className={`${config.iconColor} text-xl`}>
          {config.icon}
        </div>
      </div>
    </div>
  );
};

export default function SecurityPage() {
  const [logs, setLogs] = useState<LogItem[]>(mockLogs);
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const [filterType, setFilterType] = useState<LogType>('all');
  const [filterLevel, setFilterLevel] = useState<LogLevel>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');
  
  // 过滤日志
  const filteredLogs = logs.filter(log => {
    // 类型过滤
    if (filterType !== 'all' && log.type !== filterType) {
      return false;
    }
    
    // 级别过滤
    if (filterLevel !== 'all' && log.level !== filterLevel) {
      return false;
    }
    
    // 搜索过滤
    if (searchTerm && !log.action.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !log.details.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.user.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // 选择日志
  const handleSelectLog = (log: LogItem) => {
    setSelectedLog(log);
  };
  
  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // 导出日志
  const handleExportLogs = (format: 'csv' | 'json') => {
    alert(`日志将以${format.toUpperCase()}格式导出`);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">安全与日志</h1>
          <p className="text-gray-600">监控系统安全和查看操作日志</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Link href="/admin/security/settings" className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            安全设置
          </Link>
          <div className="relative">
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
              onClick={() => {
                const dropdown = document.getElementById('export-dropdown');
                if (dropdown) {
                  dropdown.classList.toggle('hidden');
                }
              }}
            >
              导出日志
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div id="export-dropdown" className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExportLogs('csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  导出为CSV
                </button>
                <button
                  onClick={() => handleExportLogs('json')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  导出为JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 安全指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {securityMetrics.map((metric, index) => (
          <SecurityMetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* 日期范围选择器 */}
      <div className="mb-6">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setDateRange('today')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              dateRange === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            今日
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 text-sm font-medium ${
              dateRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            本周
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              dateRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            本月
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 日志列表 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium">日志列表</h2>
                <div className="text-sm text-gray-500">
                  {filteredLogs.length} 条记录
                </div>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="搜索日志..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-2 mb-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as LogType)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">所有类型</option>
                  <option value="login">登录</option>
                  <option value="operation">操作</option>
                  <option value="security">安全</option>
                  <option value="error">错误</option>
                </select>
                
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value as LogLevel)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">所有级别</option>
                  <option value="info">信息</option>
                  <option value="warning">警告</option>
                  <option value="error">错误</option>
                  <option value="critical">严重</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
              {filteredLogs.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {filteredLogs.map((log) => (
                    <li key={log.id}>
                      <button
                        onClick={() => handleSelectLog(log)}
                        className={`w-full text-left p-4 hover:bg-gray-50 ${
                          selectedLog?.id === log.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <TypeBadge type={log.type} />
                          <LevelBadge level={log.level} />
                        </div>
                        <h3 className="font-medium text-gray-900 mt-1">{log.action}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {log.user.name} ({log.user.role})
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(log.timestamp)}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">没有找到匹配的日志记录</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 日志详情 */}
        <div className="lg:col-span-2">
          {selectedLog ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <TypeBadge type={selectedLog.type} />
                      <LevelBadge level={selectedLog.level} />
                    </div>
                    <h2 className="text-xl font-semibold">{selectedLog.action}</h2>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(selectedLog.timestamp)}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">详细信息:</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedLog.details}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">用户:</h3>
                    <p className="text-gray-600">{selectedLog.user.name} ({selectedLog.user.role})</p>
                    {selectedLog.user.id !== 'system' && (
                      <Link href={`/admin/users/${selectedLog.user.id}`} className="text-sm text-blue-600 hover:underline">
                        查看用户资料
                      </Link>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">IP地址:</h3>
                    <p className="text-gray-600">{selectedLog.ip}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">用户代理:</h3>
                  <p className="text-gray-600 text-sm break-all">{selectedLog.userAgent}</p>
                </div>
                
                <div className="flex space-x-3">
                  {selectedLog.level === 'warning' || selectedLog.level === 'error' || selectedLog.level === 'critical' ? (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      标记为已处理
                    </button>
                  ) : null}
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    添加备注
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center h-full">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mb-2">从左侧选择一条日志记录</p>
              <p className="text-gray-400 text-sm">选择日志后可以查看详细信息</p>
            </div>
          )}
        </div>
      </div>

      {/* 安全建议 */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">安全建议</h2>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <h3 className="font-medium text-blue-700">启用双因素认证</h3>
            <p className="text-sm text-blue-600 mt-1">建议为所有管理员账户启用双因素认证，提高账户安全性。</p>
          </div>
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <h3 className="font-medium text-green-700">系统安全更新</h3>
            <p className="text-sm text-green-600 mt-1">系统安全组件已更新到最新版本，无需额外操作。</p>
          </div>
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <h3 className="font-medium text-yellow-700">异常IP访问增加</h3>
            <p className="text-sm text-yellow-600 mt-1">过去24小时内检测到异常IP访问增加，建议查看详细日志并考虑调整访问限制规则。</p>
          </div>
        </div>
      </div>
    </div>
  );
} 