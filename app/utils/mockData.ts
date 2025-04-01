// 模拟管理后台数据
export const adminMockData = {
  // 统计数据
  stats: {
    totalPrompts: 1247,
    totalUsers: 3842,
    dailyVisits: 12563,
    pendingReviews: 24
  },
  
  // 最近活动
  recentActivities: [
    {
      id: 1,
      title: "新提示词已提交",
      description: "用户 张三 提交了新的提示词 \"高效学习计划生成器\"",
      time: "10分钟前",
      type: "new_prompt"
    },
    {
      id: 2,
      title: "用户注册",
      description: "新用户 李四 完成了注册",
      time: "30分钟前",
      type: "user_register"
    },
    {
      id: 3,
      title: "提示词被举报",
      description: "提示词 \"自动回复生成器\" 被用户举报为不适当内容",
      time: "1小时前",
      type: "prompt_reported"
    },
    {
      id: 4,
      title: "系统更新",
      description: "系统完成了自动备份",
      time: "2小时前",
      type: "system_update"
    },
    {
      id: 5,
      title: "提示词审核通过",
      description: "管理员 王五 审核通过了5个提示词",
      time: "3小时前",
      type: "prompt_approved"
    }
  ],
  
  // 分类分布
  categoryDistribution: [
    { name: "解决问题型", count: 152, percentage: 30 },
    { name: "创意生成型", count: 89, percentage: 18 },
    { name: "知识学习型", count: 76, percentage: 15 },
    { name: "效率提升型", count: 113, percentage: 22 },
    { name: "决策辅助型", count: 42, percentage: 8 },
    { name: "其他", count: 35, percentage: 7 }
  ],
  
  // 待审核提示词
  pendingPrompts: [
    {
      id: "p1",
      title: "商业计划书生成器",
      author: "张三",
      category: "创意生成型",
      submitTime: "2023-05-15T08:30:00Z",
      status: "pending"
    },
    {
      id: "p2",
      title: "论文研究助手",
      author: "李四",
      category: "知识学习型",
      submitTime: "2023-05-14T15:45:00Z",
      status: "pending"
    },
    {
      id: "p3",
      title: "简历优化工具",
      author: "王五",
      category: "效率提升型",
      submitTime: "2023-05-14T09:20:00Z",
      status: "pending"
    }
  ],
  
  // 安全日志
  securityLogs: [
    {
      id: "s1",
      type: "login_attempt",
      level: "warning",
      timestamp: "2023-05-15T10:30:00Z",
      user: "admin",
      ip: "192.168.1.100",
      details: "失败的登录尝试，密码错误"
    },
    {
      id: "s2",
      type: "permission_change",
      level: "info",
      timestamp: "2023-05-15T09:15:00Z",
      user: "admin",
      ip: "192.168.1.101",
      details: "更改了用户 'editor1' 的权限"
    },
    {
      id: "s3",
      type: "content_delete",
      level: "info",
      timestamp: "2023-05-15T08:45:00Z",
      user: "editor1",
      ip: "192.168.1.102",
      details: "删除了1个提示词"
    },
    {
      id: "s4",
      type: "suspicious_activity",
      level: "critical",
      timestamp: "2023-05-14T23:10:00Z",
      user: "unknown",
      ip: "203.45.67.89",
      details: "检测到可疑的API请求模式"
    }
  ],
  
  // 用户数据
  users: [
    {
      id: "u1",
      username: "张三",
      email: "zhangsan@example.com",
      registered: "2023-04-10T08:30:00Z",
      promptsCount: 12,
      status: "active"
    },
    {
      id: "u2",
      username: "李四",
      email: "lisi@example.com",
      registered: "2023-04-15T14:20:00Z",
      promptsCount: 5,
      status: "active"
    },
    {
      id: "u3",
      username: "王五",
      email: "wangwu@example.com",
      registered: "2023-04-20T09:45:00Z",
      promptsCount: 8,
      status: "suspended"
    }
  ],
  
  // 系统设置
  settings: {
    approvalRequired: true,
    maxPromptSize: 10000,
    allowedCategories: ["解决问题型", "创意生成型", "知识学习型", "效率提升型", "决策辅助型", "其他"],
    autoBackupEnabled: true,
    backupFrequency: "daily",
    contentFilterLevel: "medium"
  }
};

// 模拟本地化数据
export const localizationMockData = {
  supportedLanguages: [
    { code: "zh-CN", name: "简体中文", nativeName: "简体中文", enabled: true, completionPercentage: 100 },
    { code: "en-US", name: "English (US)", nativeName: "English (US)", enabled: true, completionPercentage: 85 },
    { code: "ja-JP", name: "Japanese", nativeName: "日本語", enabled: false, completionPercentage: 42 },
    { code: "ko-KR", name: "Korean", nativeName: "한국어", enabled: false, completionPercentage: 30 },
    { code: "fr-FR", name: "French", nativeName: "Français", enabled: false, completionPercentage: 15 }
  ],
  
  translationProgress: {
    "homepage": { "zh-CN": 100, "en-US": 95, "ja-JP": 50, "ko-KR": 30, "fr-FR": 15 },
    "admin_panel": { "zh-CN": 100, "en-US": 80, "ja-JP": 40, "ko-KR": 20, "fr-FR": 10 },
    "prompt_detail": { "zh-CN": 100, "en-US": 90, "ja-JP": 45, "ko-KR": 25, "fr-FR": 20 },
    "user_profile": { "zh-CN": 100, "en-US": 85, "ja-JP": 35, "ko-KR": 30, "fr-FR": 15 }
  },
  
  dateTimeFormats: {
    "zh-CN": { date: "YYYY年MM月DD日", time: "HH:mm:ss", dateTime: "YYYY年MM月DD日 HH:mm:ss" },
    "en-US": { date: "MM/DD/YYYY", time: "hh:mm:ss A", dateTime: "MM/DD/YYYY hh:mm:ss A" },
    "ja-JP": { date: "YYYY年MM月DD日", time: "HH:mm:ss", dateTime: "YYYY年MM月DD日 HH:mm:ss" },
    "ko-KR": { date: "YYYY년 MM월 DD일", time: "HH:mm:ss", dateTime: "YYYY년 MM월 DD일 HH:mm:ss" },
    "fr-FR": { date: "DD/MM/YYYY", time: "HH:mm:ss", dateTime: "DD/MM/YYYY HH:mm:ss" }
  }
};

// 模拟分析数据
export const analyticsMockData = {
  // 用户增长
  userGrowth: {
    daily: [
      { date: "2023-05-09", count: 120 },
      { date: "2023-05-10", count: 142 },
      { date: "2023-05-11", count: 131 },
      { date: "2023-05-12", count: 155 },
      { date: "2023-05-13", count: 168 },
      { date: "2023-05-14", count: 172 },
      { date: "2023-05-15", count: 180 }
    ],
    weekly: [
      { date: "2023-04-17", count: 850 },
      { date: "2023-04-24", count: 920 },
      { date: "2023-05-01", count: 965 },
      { date: "2023-05-08", count: 1050 },
      { date: "2023-05-15", count: 1068 }
    ],
    monthly: [
      { date: "2022-12", count: 2800 },
      { date: "2023-01", count: 3100 },
      { date: "2023-02", count: 3250 },
      { date: "2023-03", count: 3400 },
      { date: "2023-04", count: 3650 },
      { date: "2023-05", count: 3842 }
    ]
  },
  
  // 内容统计
  contentStats: {
    promptsByCategory: [
      { category: "解决问题型", count: 152 },
      { category: "创意生成型", count: 89 },
      { category: "知识学习型", count: 76 },
      { category: "效率提升型", count: 113 },
      { category: "决策辅助型", count: 42 },
      { category: "其他", count: 35 }
    ],
    dailySubmissions: [
      { date: "2023-05-09", count: 28 },
      { date: "2023-05-10", count: 32 },
      { date: "2023-05-11", count: 25 },
      { date: "2023-05-12", count: 30 },
      { date: "2023-05-13", count: 35 },
      { date: "2023-05-14", count: 22 },
      { date: "2023-05-15", count: 27 }
    ],
    popularPrompts: [
      { id: "pp1", title: "论文摘要生成", views: 2450, category: "知识学习型" },
      { id: "pp2", title: "SEO文案优化", views: 2100, category: "效率提升型" },
      { id: "pp3", title: "创意故事构思", views: 1850, category: "创意生成型" },
      { id: "pp4", title: "产品描述生成", views: 1650, category: "效率提升型" },
      { id: "pp5", title: "代码优化助手", views: 1500, category: "解决问题型" }
    ]
  },
  
  // 流量数据
  trafficData: {
    dailyPageViews: [
      { date: "2023-05-09", count: 5600 },
      { date: "2023-05-10", count: 6200 },
      { date: "2023-05-11", count: 5900 },
      { date: "2023-05-12", count: 6500 },
      { date: "2023-05-13", count: 7100 },
      { date: "2023-05-14", count: 6800 },
      { date: "2023-05-15", count: 7200 }
    ],
    trafficSources: [
      { source: "直接访问", percentage: 35 },
      { source: "搜索引擎", percentage: 40 },
      { source: "社交媒体", percentage: 15 },
      { source: "外部链接", percentage: 8 },
      { source: "其他", percentage: 2 }
    ],
    deviceTypes: [
      { type: "桌面", percentage: 55 },
      { type: "移动", percentage: 40 },
      { type: "平板", percentage: 5 }
    ],
    userLocations: {
      countries: [
        { name: "中国", count: 2500 },
        { name: "美国", count: 600 },
        { name: "日本", count: 250 },
        { name: "韩国", count: 180 },
        { name: "其他", count: 312 }
      ],
      cities: [
        { name: "北京", count: 650 },
        { name: "上海", count: 580 },
        { name: "广州", count: 420 },
        { name: "深圳", count: 380 },
        { name: "杭州", count: 240 }
      ]
    }
  }
}; 