import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { getUserIdFromHeader, isAdmin } from '@/lib/auth';

// GET: 获取分析数据
export async function GET(request: Request) {
  try {
    // 获取认证头并验证管理员权限
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromHeader(authHeader);

    // 检查权限
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { success: false, error: '权限不足，需要管理员权限' },
        { status: 403 }
      );
    }
    
    // 获取请求参数，如果有需要的话
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily'; // 可以是 daily, weekly, monthly
    
    // 设置日期范围
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'daily':
        startDate.setDate(now.getDate() - 7); // 过去7天
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 30); // 过去1个月
        break;
      case 'monthly':
        startDate.setDate(now.getDate() - 90); // 过去3个月
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    const startDateStr = startDate.toISOString();
    
    // 从Supabase获取用户增长数据
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, created_at')
      .gte('created_at', startDateStr);
    
    if (usersError) {
      console.error('获取用户数据失败:', usersError);
    }
    
    // 从Supabase获取提示词数据
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('id, created_at, category, title, likes, user:user_id(name)')
      .gte('created_at', startDateStr);
    
    if (promptsError) {
      console.error('获取提示词数据失败:', promptsError);
    }
    
    // 计算用户增长数据
    const userGrowth = processUserGrowth(users || [], period);
    
    // 计算提示词提交和分类数据
    const contentStats = processContentStats(prompts || [], period);
    
    // 计算最受欢迎的提示词
    const popularPrompts = (prompts || [])
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5)
      .map(prompt => ({
        id: prompt.id,
        title: prompt.title,
        likes: prompt.likes || 0,
        author: prompt.user?.name || '未知用户'
      }));
    
    // 整合所有数据
    const responseData = {
      userGrowth,
      contentStats,
      popularPrompts,
      // 以下数据可能需要特定的表来存储，这里暂时使用模拟数据
      pageViews: generateMockPageViews(period),
      trafficSources: generateMockTrafficSources(),
      deviceTypes: generateMockDeviceTypes(),
      locations: generateMockLocations()
    };
    
    return NextResponse.json({ 
      success: true,
      data: responseData
    }, { status: 200 });
  } catch (error) {
    console.error('获取分析数据失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '获取分析数据失败: ' + (error instanceof Error ? error.message : String(error)) 
    }, { status: 500 });
  }
}

// 处理用户增长数据
function processUserGrowth(users, period) {
  const result = [];
  const groupedData = groupByDate(users, period);
  
  for (const [date, dateUsers] of Object.entries(groupedData)) {
    result.push({
      date,
      newUsers: dateUsers.length
    });
  }
  
  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// 处理内容统计数据
function processContentStats(prompts, period) {
  // 计算按分类分组的提示词数量
  const categoryCounts = {};
  prompts.forEach(prompt => {
    const category = prompt.category || '未分类';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  const categoryDistribution = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count
  }));
  
  // 计算每日/每周/每月提交数
  const submissionsByDate = [];
  const groupedData = groupByDate(prompts, period);
  
  for (const [date, datePrompts] of Object.entries(groupedData)) {
    submissionsByDate.push({
      date,
      count: datePrompts.length
    });
  }
  
  return {
    totalPrompts: prompts.length,
    promptsByCategory: categoryDistribution,
    submissions: submissionsByDate.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  };
}

// 按日期分组数据
function groupByDate(items, period) {
  const result = {};
  
  items.forEach(item => {
    const date = new Date(item.created_at);
    let groupKey;
    
    switch (period) {
      case 'daily':
        groupKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'weekly':
        // 获取所在周的周一
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date);
        monday.setDate(diff);
        groupKey = monday.toISOString().split('T')[0];
        break;
      case 'monthly':
        groupKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
      default:
        groupKey = date.toISOString().split('T')[0];
    }
    
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    
    result[groupKey].push(item);
  });
  
  return result;
}

// 以下是生成模拟数据的函数
function generateMockPageViews(period) {
  return Array(7).fill(0).map((_, i) => ({
    date: new Date(Date.now() - (6-i) * 24 * 3600 * 1000).toISOString().split('T')[0],
    views: Math.floor(Math.random() * 500) + 100
  }));
}

function generateMockTrafficSources() {
  return [
    { source: '直接访问', percentage: 35 },
    { source: '搜索引擎', percentage: 30 },
    { source: '社交媒体', percentage: 25 },
    { source: '外部链接', percentage: 10 }
  ];
}

function generateMockDeviceTypes() {
  return [
    { type: '桌面', percentage: 55 },
    { type: '移动', percentage: 40 },
    { type: '平板', percentage: 5 }
  ];
}

function generateMockLocations() {
  return [
    { location: '中国', users: 60 },
    { location: '美国', users: 15 },
    { location: '印度', users: 8 },
    { location: '英国', users: 5 },
    { location: '其他', users: 12 }
  ];
} 