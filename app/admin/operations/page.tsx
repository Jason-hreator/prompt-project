"use client";

import { useState } from 'react';
import Link from 'next/link';

// 活动类型
type CampaignType = 'promotion' | 'event' | 'notification' | 'survey';

// 活动状态
type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';

// 活动接口
interface Campaign {
  id: string;
  title: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  targetAudience: string[];
  metrics?: {
    impressions: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
  };
}

// 模拟数据
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: '新用户注册优惠',
    description: '新用户注册即可获得30天高级会员体验',
    type: 'promotion',
    status: 'active',
    startDate: '2023-06-01',
    endDate: '2023-06-30',
    targetAudience: ['new_users'],
    metrics: {
      impressions: 12500,
      clicks: 3200,
      conversions: 850,
      conversionRate: 26.56
    }
  },
  {
    id: '2',
    title: 'AI提示词创作大赛',
    description: '参与AI提示词创作大赛，赢取丰厚奖品',
    type: 'event',
    status: 'scheduled',
    startDate: '2023-07-01',
    endDate: '2023-07-15',
    targetAudience: ['all_users', 'creators']
  },
  {
    id: '3',
    title: '用户满意度调查',
    description: '参与调查，帮助我们改进产品',
    type: 'survey',
    status: 'draft',
    startDate: '2023-07-10',
    endDate: '2023-07-20',
    targetAudience: ['active_users']
  },
  {
    id: '4',
    title: '系统更新通知',
    description: '平台将于6月25日进行系统升级，届时服务将暂停2小时',
    type: 'notification',
    status: 'scheduled',
    startDate: '2023-06-25',
    endDate: '2023-06-25',
    targetAudience: ['all_users']
  },
  {
    id: '5',
    title: '高级会员促销',
    description: '限时优惠：高级会员年付享8折',
    type: 'promotion',
    status: 'completed',
    startDate: '2023-05-01',
    endDate: '2023-05-15',
    targetAudience: ['free_users', 'expired_premium'],
    metrics: {
      impressions: 8700,
      clicks: 2100,
      conversions: 430,
      conversionRate: 20.48
    }
  },
  {
    id: '6',
    title: '内容创作者招募',
    description: '招募优质内容创作者，享受平台流量扶持',
    type: 'event',
    status: 'active',
    startDate: '2023-06-10',
    endDate: '2023-07-10',
    targetAudience: ['creators'],
    metrics: {
      impressions: 5200,
      clicks: 980,
      conversions: 120,
      conversionRate: 12.24
    }
  },
  {
    id: '7',
    title: '功能更新反馈',
    description: '关于最新功能更新的用户反馈收集',
    type: 'survey',
    status: 'cancelled',
    startDate: '2023-05-20',
    endDate: '2023-05-30',
    targetAudience: ['beta_users']
  }
];

// 受众群体标签
const audienceLabels: Record<string, string> = {
  all_users: '所有用户',
  new_users: '新用户',
  active_users: '活跃用户',
  inactive_users: '不活跃用户',
  free_users: '免费用户',
  premium_users: '付费用户',
  expired_premium: '过期付费用户',
  creators: '内容创作者',
  beta_users: '测试用户'
};

// 状态标签组件
const StatusBadge = ({ status }: { status: CampaignStatus }) => {
  const statusConfig = {
    draft: {
      color: 'bg-gray-100 text-gray-800',
      text: '草稿'
    },
    scheduled: {
      color: 'bg-blue-100 text-blue-800',
      text: '已排期'
    },
    active: {
      color: 'bg-green-100 text-green-800',
      text: '进行中'
    },
    completed: {
      color: 'bg-purple-100 text-purple-800',
      text: '已完成'
    },
    cancelled: {
      color: 'bg-red-100 text-red-800',
      text: '已取消'
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
const TypeBadge = ({ type }: { type: CampaignType }) => {
  const typeConfig = {
    promotion: {
      color: 'bg-yellow-100 text-yellow-800',
      text: '促销活动'
    },
    event: {
      color: 'bg-blue-100 text-blue-800',
      text: '线上活动'
    },
    notification: {
      color: 'bg-gray-100 text-gray-800',
      text: '系统通知'
    },
    survey: {
      color: 'bg-green-100 text-green-800',
      text: '用户调查'
    }
  };
  
  const config = typeConfig[type];
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

// 受众标签组件
const AudienceBadge = ({ audience }: { audience: string }) => {
  return (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-1 mb-1 inline-block">
      {audienceLabels[audience] || audience}
    </span>
  );
};

// 指标卡片组件
const MetricCard = ({ title, value, icon, change }: { title: string, value: string, icon: React.ReactNode, change?: string }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-bold mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="bg-blue-100 p-2 rounded-lg">
          <span className="text-blue-600">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default function OperationsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [filterType, setFilterType] = useState<CampaignType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // 过滤活动
  const filteredCampaigns = campaigns.filter(campaign => {
    // 类型过滤
    if (filterType !== 'all' && campaign.type !== filterType) {
      return false;
    }
    
    // 状态过滤
    if (filterStatus !== 'all' && campaign.status !== filterStatus) {
      return false;
    }
    
    // 搜索过滤
    if (searchTerm && !campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !campaign.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // 选择活动
  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };
  
  // 打开添加模态框
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };
  
  // 关闭添加模态框
  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };
  
  // 打开删除模态框
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };
  
  // 关闭删除模态框
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  
  // 删除活动
  const handleDeleteCampaign = () => {
    if (!selectedCampaign) return;
    
    const updatedCampaigns = campaigns.filter(campaign => campaign.id !== selectedCampaign.id);
    setCampaigns(updatedCampaigns);
    setSelectedCampaign(null);
    closeDeleteModal();
  };
  
  // 更改活动状态
  const handleChangeStatus = (status: CampaignStatus) => {
    if (!selectedCampaign) return;
    
    const updatedCampaigns = campaigns.map(campaign => {
      if (campaign.id === selectedCampaign.id) {
        return { ...campaign, status };
      }
      return campaign;
    });
    
    setCampaigns(updatedCampaigns);
    setSelectedCampaign({ ...selectedCampaign, status });
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">运营工具</h1>
          <p className="text-gray-600">管理营销活动和用户运营策略</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            创建活动
          </button>
          <Link href="/admin/operations/templates" className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            活动模板
          </Link>
        </div>
      </div>

      {/* 运营概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="活跃活动" 
          value={campaigns.filter(c => c.status === 'active').length.toString()} 
          icon="🚀" 
        />
        <MetricCard 
          title="本月转化" 
          value="1,245" 
          icon="📈" 
          change="+12.5%" 
        />
        <MetricCard 
          title="平均转化率" 
          value="18.3%" 
          icon="🎯" 
          change="+2.1%" 
        />
        <MetricCard 
          title="用户参与度" 
          value="32.7%" 
          icon="👥" 
          change="-1.5%" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 活动列表 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium">活动列表</h2>
                <div className="text-sm text-gray-500">
                  {filteredCampaigns.length} 个活动
                </div>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="搜索活动..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-2 mb-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as CampaignType | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">所有类型</option>
                  <option value="promotion">促销活动</option>
                  <option value="event">线上活动</option>
                  <option value="notification">系统通知</option>
                  <option value="survey">用户调查</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as CampaignStatus | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">所有状态</option>
                  <option value="draft">草稿</option>
                  <option value="scheduled">已排期</option>
                  <option value="active">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              {filteredCampaigns.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {filteredCampaigns.map((campaign) => (
                    <li key={campaign.id}>
                      <button
                        onClick={() => handleSelectCampaign(campaign)}
                        className={`w-full text-left p-4 hover:bg-gray-50 ${
                          selectedCampaign?.id === campaign.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <TypeBadge type={campaign.type} />
                          <StatusBadge status={campaign.status} />
                        </div>
                        <h3 className="font-medium text-gray-900 mt-1">{campaign.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{campaign.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs text-gray-500">
                            {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">没有找到匹配的活动</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 活动详情 */}
        <div className="lg:col-span-2">
          {selectedCampaign ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <TypeBadge type={selectedCampaign.type} />
                      <StatusBadge status={selectedCampaign.status} />
                    </div>
                    <h2 className="text-xl font-semibold">{selectedCampaign.title}</h2>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/admin/operations/edit/${selectedCampaign.id}`} className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                      编辑
                    </Link>
                    <button
                      onClick={openDeleteModal}
                      className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">活动描述:</h3>
                  <p className="text-gray-600">{selectedCampaign.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">开始日期:</h3>
                    <p className="text-gray-600">{formatDate(selectedCampaign.startDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">结束日期:</h3>
                    <p className="text-gray-600">{formatDate(selectedCampaign.endDate)}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">目标受众:</h3>
                  <div className="flex flex-wrap">
                    {selectedCampaign.targetAudience.map((audience) => (
                      <AudienceBadge key={audience} audience={audience} />
                    ))}
                  </div>
                </div>
                
                {selectedCampaign.metrics && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">活动数据:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-500">展示次数</p>
                        <p className="text-lg font-bold">{selectedCampaign.metrics.impressions.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-500">点击次数</p>
                        <p className="text-lg font-bold">{selectedCampaign.metrics.clicks.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-500">转化次数</p>
                        <p className="text-lg font-bold">{selectedCampaign.metrics.conversions.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-500">转化率</p>
                        <p className="text-lg font-bold">{selectedCampaign.metrics.conversionRate.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">状态管理:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCampaign.status !== 'draft' && (
                      <button
                        onClick={() => handleChangeStatus('draft')}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        标记为草稿
                      </button>
                    )}
                    {selectedCampaign.status !== 'scheduled' && (
                      <button
                        onClick={() => handleChangeStatus('scheduled')}
                        className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
                      >
                        标记为已排期
                      </button>
                    )}
                    {selectedCampaign.status !== 'active' && (
                      <button
                        onClick={() => handleChangeStatus('active')}
                        className="px-3 py-1 text-sm border border-green-300 text-green-600 rounded-md hover:bg-green-50"
                      >
                        标记为进行中
                      </button>
                    )}
                    {selectedCampaign.status !== 'completed' && (
                      <button
                        onClick={() => handleChangeStatus('completed')}
                        className="px-3 py-1 text-sm border border-purple-300 text-purple-600 rounded-md hover:bg-purple-50"
                      >
                        标记为已完成
                      </button>
                    )}
                    {selectedCampaign.status !== 'cancelled' && (
                      <button
                        onClick={() => handleChangeStatus('cancelled')}
                        className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                      >
                        标记为已取消
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Link href={`/admin/operations/analytics/${selectedCampaign.id}`} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    查看详细分析
                  </Link>
                  <Link href={`/admin/operations/duplicate/${selectedCampaign.id}`} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    复制活动
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center h-full">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p className="text-gray-500 mb-2">从左侧选择一个活动</p>
              <p className="text-gray-400 text-sm">选择活动后可以查看详情并进行管理</p>
            </div>
          )}
        </div>
      </div>

      {/* 删除确认模态框 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">删除活动</h2>
              <p className="text-gray-600 mb-4">
                确定要删除活动 "{selectedCampaign?.title}" 吗？此操作无法撤销。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteCampaign}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加活动模态框 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">创建新活动</h2>
              <p className="text-gray-600 mb-4">
                请填写以下信息创建新的营销活动。
              </p>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">此功能正在开发中</p>
                <button
                  onClick={closeAddModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}