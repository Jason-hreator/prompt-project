"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn, hasRole, getToken } from '../../../lib/auth';

// 操作日志类型定义
interface LogEntry {
  id: number;
  userId: number;
  username: string;
  action: string;
  target: string;
  targetId?: number | string;
  details?: string;
  ip?: string;
  date: string;
}

export default function AdminLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 20;
  
  // 模拟日志数据 - 实际项目中应该从API获取
  const mockLogs: LogEntry[] = [
    {
      id: 1,
      userId: 1,
      username: '管理员',
      action: '登录',
      target: '系统',
      ip: '192.168.1.1',
      date: new Date().toISOString()
    },
    {
      id: 2,
      userId: 1,
      username: '管理员',
      action: '审核',
      target: '提示词',
      targetId: 5,
      details: '将状态从"待审核"改为"已通过"',
      date: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      userId: 1,
      username: '管理员',
      action: '删除',
      target: '评论',
      targetId: 12,
      details: '删除违规评论',
      date: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 4,
      userId: 2,
      username: '普通用户',
      action: '登录',
      target: '系统',
      ip: '192.168.1.2',
      date: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: 5,
      userId: 2,
      username: '普通用户',
      action: '提交',
      target: '提示词',
      targetId: 8,
      details: '提交新提示词',
      date: new Date(Date.now() - 14400000).toISOString()
    },
    {
      id: 6,
      userId: 3,
      username: '测试用户',
      action: '点赞',
      target: '提示词',
      targetId: 3,
      date: new Date(Date.now() - 18000000).toISOString()
    },
    {
      id: 7,
      userId: 1,
      username: '管理员',
      action: '更新',
      target: '系统设置',
      details: '更新网站标题',
      date: new Date(Date.now() - 21600000).toISOString()
    },
    {
      id: 8,
      userId: 1,
      username: '管理员',
      action: '审核',
      target: '提示词',
      targetId: 7,
      details: '将状态从"待审核"改为"已拒绝"',
      date: new Date(Date.now() - 25200000).toISOString()
    },
    {
      id: 9,
      userId: 4,
      username: '新用户',
      action: '注册',
      target: '系统',
      ip: '192.168.1.4',
      date: new Date(Date.now() - 28800000).toISOString()
    },
    {
      id: 10,
      userId: 1,
      username: '管理员',
      action: '添加',
      target: '分类',
      targetId: 4,
      details: '添加新分类"数据分析"',
      date: new Date(Date.now() - 32400000).toISOString()
    },
  ];

  // 为模拟数据生成更多条目
  const generateMoreLogs = () => {
    const actions = ['登录', '审核', '删除', '提交', '点赞', '更新', '注册', '添加', '修改', '退出'];
    const targets = ['系统', '提示词', '评论', '用户', '分类', '系统设置'];
    const users = [
      { id: 1, name: '管理员' },
      { id: 2, name: '普通用户' },
      { id: 3, name: '测试用户' },
      { id: 4, name: '新用户' }
    ];

    const additionalLogs: LogEntry[] = [];
    for (let i = 11; i <= 100; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const target = targets[Math.floor(Math.random() * targets.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const hoursAgo = Math.floor(Math.random() * 240) + 1; // 1-240小时前

      additionalLogs.push({
        id: i,
        userId: user.id,
        username: user.name,
        action: action,
        target: target,
        targetId: Math.floor(Math.random() * 20) + 1,
        details: `${action}${target}记录`,
        date: new Date(Date.now() - hoursAgo * 3600000).toISOString()
      });
    }

    return [...mockLogs, ...additionalLogs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };
  
  // 检查权限并加载日志数据
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoggedIn()) {
        router.push('/login?redirect=/admin/logs');
        return;
      }
      
      if (!hasRole('admin')) {
        setError('您没有权限访问此页面');
        setLoading(false);
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(true);
      fetchLogs();
    };
    
    checkAuth();
  }, [router]);
  
  // 模拟获取日志数据
  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // 在实际项目中，这里应该是API调用
      // 暂时使用模拟数据
      setTimeout(() => {
        const allLogs = generateMoreLogs();
        setLogs(allLogs);
        setTotalPages(Math.ceil(allLogs.length / logsPerPage));
        setLoading(false);
      }, 800);
      
    } catch (err) {
      setError('加载日志数据时发生错误');
      console.error('获取日志列表失败:', err);
      setLoading(false);
    }
  };
  
  // 处理操作类型过滤变化
  const handleFilterChange = (filter: string) => {
    setActionFilter(filter);
    setPage(1); // 重置到第一页
  };
  
  // 获取操作颜色
  const getActionColor = (action: string): string => {
    const actionColors: {[key: string]: string} = {
      '登录': 'bg-blue-900 text-blue-100',
      '审核': 'bg-green-900 text-green-100',
      '删除': 'bg-red-900 text-red-100',
      '提交': 'bg-purple-900 text-purple-100',
      '点赞': 'bg-pink-900 text-pink-100',
      '更新': 'bg-yellow-900 text-yellow-100',
      '注册': 'bg-indigo-900 text-indigo-100',
      '添加': 'bg-teal-900 text-teal-100',
      '修改': 'bg-orange-900 text-orange-100',
      '退出': 'bg-gray-700 text-gray-100'
    };
    
    return actionColors[action] || 'bg-gray-700 text-gray-100';
  };
  
  // 过滤和分页日志
  const filteredLogs = logs.filter(log => {
    // 操作类型过滤
    if (actionFilter !== 'all' && log.action !== actionFilter) {
      return false;
    }
    
    // 搜索过滤
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.username.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.target.toLowerCase().includes(searchLower) ||
        (log.details && log.details.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });
  
  // 分页后的日志
  const paginatedLogs = filteredLogs.slice((page - 1) * logsPerPage, page * logsPerPage);
  
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
        <h1 className="text-3xl font-bold">操作日志</h1>
        <div className="flex space-x-2">
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            返回仪表盘
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-800 text-white p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          {/* 操作类型过滤按钮 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1 rounded-md text-sm ${
                actionFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => handleFilterChange('登录')}
              className={`px-3 py-1 rounded-md text-sm ${
                actionFilter === '登录'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => handleFilterChange('审核')}
              className={`px-3 py-1 rounded-md text-sm ${
                actionFilter === '审核'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              审核
            </button>
            <button
              onClick={() => handleFilterChange('删除')}
              className={`px-3 py-1 rounded-md text-sm ${
                actionFilter === '删除'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              删除
            </button>
            <button
              onClick={() => handleFilterChange('提交')}
              className={`px-3 py-1 rounded-md text-sm ${
                actionFilter === '提交'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              提交
            </button>
          </div>
          
          {/* 搜索框 */}
          <div className="w-full md:w-auto">
            <input
              type="text"
              placeholder="搜索用户、操作类型或内容"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // 重置到第一页
              }}
              className="w-full md:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4">加载中...</p>
        </div>
      ) : (
        <>
          {paginatedLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      时间
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      用户
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      操作
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      对象
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      详情
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {new Date(log.date).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="font-medium text-gray-200">{log.username}</span>
                        <span className="text-gray-400 ml-1">(ID: {log.userId})</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {log.target} {log.targetId && `#${log.targetId}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {log.details || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                        {log.ip || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* 分页控件 */}
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-400">
                  显示 {filteredLogs.length} 条记录中的 {(page - 1) * logsPerPage + 1}-
                  {Math.min(page * logsPerPage, filteredLogs.length)}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page <= 1}
                    className={`px-3 py-1 rounded-md text-sm ${
                      page <= 1
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    上一页
                  </button>
                  <div className="flex items-center px-3 py-1 bg-gray-800 rounded-md text-sm text-gray-300">
                    第 {page} / {totalPages} 页
                  </div>
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page >= totalPages}
                    className={`px-3 py-1 rounded-md text-sm ${
                      page >= totalPages
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-800 rounded-lg">
              <h3 className="text-xl mb-2">
                没有找到匹配的日志记录
              </h3>
              {searchTerm && (
                <p className="text-gray-400 mt-2">
                  没有找到包含 "{searchTerm}" 的日志
                </p>
              )}
              {actionFilter !== 'all' && (
                <p className="text-gray-400 mt-2">
                  没有 "{actionFilter}" 类型的操作记录
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 