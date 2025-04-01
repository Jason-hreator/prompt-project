"use client";

import { useState } from 'react';
import Link from 'next/link';

// 内容类型
type ContentType = 'prompt' | 'comment' | 'report';

// 审核状态
type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'all';

// 内容项接口
interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

// 模拟数据
const mockContentItems: ContentItem[] = [
  {
    id: '1',
    type: 'prompt',
    title: '高效邮件回复助手',
    content: '我需要一个能够帮助我快速回复工作邮件的提示词，能够根据邮件内容自动生成专业、简洁的回复。',
    author: {
      id: 'user1',
      name: '张明',
      avatar: '/avatars/user1.jpg'
    },
    createdAt: '2023-06-15T08:30:00Z',
    status: 'pending'
  },
  {
    id: '2',
    type: 'comment',
    title: '评论于"AI绘画提示词大全"',
    content: '这个提示词集合非常棒！我使用其中的几个提示词创作了一些令人惊艳的作品。强烈推荐给所有对AI绘画感兴趣的人。',
    author: {
      id: 'user2',
      name: '李华',
      avatar: '/avatars/user2.jpg'
    },
    createdAt: '2023-06-14T15:45:00Z',
    status: 'pending'
  },
  {
    id: '3',
    type: 'report',
    title: '举报不当内容',
    content: '这个提示词包含不适当的内容，可能违反了平台的使用条款。具体来说，它包含了可能导致生成有害内容的指导。',
    author: {
      id: 'user3',
      name: '王芳',
      avatar: '/avatars/user3.jpg'
    },
    createdAt: '2023-06-14T10:20:00Z',
    status: 'pending'
  },
  {
    id: '4',
    type: 'prompt',
    title: '创意故事生成器',
    content: '我想要一个能够根据几个关键词生成创意短篇故事的提示词。故事应该有引人入胜的开头、中间的冲突和满意的结局。',
    author: {
      id: 'user4',
      name: '赵伟',
      avatar: '/avatars/user4.jpg'
    },
    createdAt: '2023-06-13T14:10:00Z',
    status: 'approved'
  },
  {
    id: '5',
    type: 'comment',
    title: '评论于"编程面试准备指南"',
    content: '这个提示词帮助我准备了技术面试，最终成功获得了理想的工作机会！非常感谢作者的分享。',
    author: {
      id: 'user5',
      name: '刘强',
      avatar: '/avatars/user5.jpg'
    },
    createdAt: '2023-06-12T09:30:00Z',
    status: 'approved'
  },
  {
    id: '6',
    type: 'prompt',
    title: '健康饮食计划生成器',
    content: '这个提示词声称可以生成个性化的健康饮食计划，但实际上它提供的建议可能对某些人有健康风险。',
    author: {
      id: 'user6',
      name: '陈静',
      avatar: '/avatars/user6.jpg'
    },
    createdAt: '2023-06-11T16:20:00Z',
    status: 'rejected',
    reason: '包含未经验证的健康建议，可能对用户造成风险'
  },
  {
    id: '7',
    type: 'report',
    title: '举报侵权内容',
    content: '这个提示词直接复制了我之前发布的内容，侵犯了我的知识产权。请审核并采取适当措施。',
    author: {
      id: 'user7',
      name: '杨光',
      avatar: '/avatars/user7.jpg'
    },
    createdAt: '2023-06-10T11:45:00Z',
    status: 'approved'
  },
];

// 状态标签组件
const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'rejected' }) => {
  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800',
      text: '待审核'
    },
    approved: {
      color: 'bg-green-100 text-green-800',
      text: '已批准'
    },
    rejected: {
      color: 'bg-red-100 text-red-800',
      text: '已拒绝'
    }
  };
  
  const config = statusConfig[status];
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

// 类型标签组件
const TypeBadge = ({ type }: { type: ContentType }) => {
  const typeConfig = {
    prompt: {
      color: 'bg-blue-100 text-blue-800',
      text: '提示词'
    },
    comment: {
      color: 'bg-purple-100 text-purple-800',
      text: '评论'
    },
    report: {
      color: 'bg-red-100 text-red-800',
      text: '举报'
    }
  };
  
  const config = typeConfig[type];
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

export default function ContentReviewPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>(mockContentItems);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ReviewStatus>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  
  // 过滤内容
  const filteredItems = contentItems.filter(item => {
    // 类型过滤
    if (filterType !== 'all' && item.type !== filterType) {
      return false;
    }
    
    // 状态过滤
    if (filterStatus !== 'all' && item.status !== filterStatus) {
      return false;
    }
    
    // 搜索过滤
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !item.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.author.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // 选择内容项
  const handleSelectItem = (item: ContentItem) => {
    setSelectedItem(item);
  };
  
  // 批准内容
  const handleApprove = () => {
    if (!selectedItem) return;
    
    const updatedItems = contentItems.map(item => {
      if (item.id === selectedItem.id) {
        return { ...item, status: 'approved' as const };
      }
      return item;
    });
    
    setContentItems(updatedItems);
    setSelectedItem({ ...selectedItem, status: 'approved' });
  };
  
  // 打开拒绝模态框
  const openRejectModal = () => {
    setRejectReason('');
    setIsRejectModalOpen(true);
  };
  
  // 关闭拒绝模态框
  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
  };
  
  // 拒绝内容
  const handleReject = () => {
    if (!selectedItem) return;
    
    const updatedItems = contentItems.map(item => {
      if (item.id === selectedItem.id) {
        return { ...item, status: 'rejected' as const, reason: rejectReason };
      }
      return item;
    });
    
    setContentItems(updatedItems);
    setSelectedItem({ ...selectedItem, status: 'rejected', reason: rejectReason });
    closeRejectModal();
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">内容审核</h1>
          <p className="text-gray-600">审核和管理用户提交的内容</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Link href="/admin/reviews/comments" className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            评论管理
          </Link>
          <Link href="/admin/reviews/reports" className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            举报处理
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 内容列表 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium">内容列表</h2>
                <div className="text-sm text-gray-500">
                  {filteredItems.length} 个项目
                </div>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="搜索内容..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-2 mb-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as ContentType | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">所有类型</option>
                  <option value="prompt">提示词</option>
                  <option value="comment">评论</option>
                  <option value="report">举报</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as ReviewStatus)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">所有状态</option>
                  <option value="pending">待审核</option>
                  <option value="approved">已批准</option>
                  <option value="rejected">已拒绝</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              {filteredItems.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleSelectItem(item)}
                        className={`w-full text-left p-4 hover:bg-gray-50 ${
                          selectedItem?.id === item.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center space-x-2">
                            <TypeBadge type={item.type} />
                            <StatusBadge status={item.status} />
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.content}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-500">
                            作者: {item.author.name}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">没有找到匹配的内容</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 内容详情 */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <TypeBadge type={selectedItem.type} />
                      <StatusBadge status={selectedItem.status} />
                    </div>
                    <h2 className="text-xl font-semibold">{selectedItem.title}</h2>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(selectedItem.createdAt)}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedItem.author.avatar ? (
                      <img 
                        src={selectedItem.author.avatar} 
                        alt={selectedItem.author.name} 
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <span className="text-gray-500">{selectedItem.author.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{selectedItem.author.name}</p>
                    <Link href={`/admin/users/${selectedItem.author.id}`} className="text-sm text-blue-600 hover:underline">
                      查看用户资料
                    </Link>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="whitespace-pre-wrap">{selectedItem.content}</p>
                </div>
                
                {selectedItem.reason && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">拒绝原因:</h3>
                    <p className="text-sm text-gray-600 bg-red-50 p-3 rounded">{selectedItem.reason}</p>
                  </div>
                )}
                
                {selectedItem.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleApprove}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      批准
                    </button>
                    <button
                      onClick={openRejectModal}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      拒绝
                    </button>
                  </div>
                )}
                
                {selectedItem.status === 'approved' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={openRejectModal}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                    >
                      标记为拒绝
                    </button>
                  </div>
                )}
                
                {selectedItem.status === 'rejected' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleApprove}
                      className="px-4 py-2 border border-green-300 text-green-600 rounded-md hover:bg-green-50"
                    >
                      标记为批准
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center h-full">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mb-2">从左侧选择一个内容项</p>
              <p className="text-gray-400 text-sm">选择内容后可以查看详情并进行审核</p>
            </div>
          )}
        </div>
      </div>

      {/* 拒绝原因模态框 */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">拒绝内容</h2>
              <p className="text-gray-600 mb-4">请提供拒绝该内容的原因，这将帮助用户理解并改进。</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请输入拒绝原因..."
                rows={4}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              ></textarea>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeRejectModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className={`px-4 py-2 bg-red-600 text-white rounded-md ${
                    !rejectReason.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                  }`}
                >
                  确认拒绝
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 