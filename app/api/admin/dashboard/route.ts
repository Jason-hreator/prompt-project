import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserIdFromHeader, isAdmin } from '@/lib/auth';

// 获取提示词数据
const getPromptsData = async () => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*');
    
    if (error) {
      console.error('读取提示词数据失败:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('读取提示词数据失败:', error);
    return [];
  }
};

// 获取用户数据
const getUsersData = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('读取用户数据失败:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('读取用户数据失败:', error);
    return [];
  }
};

// 获取分类数据
const getCategoriesData = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) {
      console.error('读取分类数据失败:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('读取分类数据失败:', error);
    return [];
  }
};

// 获取访问数据（模拟实现，实际应从日志或分析数据中获取）
const getVisitData = () => {
  // 这里我们模拟一个随机但合理的访问量
  return Math.floor(Math.random() * 5000) + 8000;
};

// 获取最近活动（从多个数据源组合）
const getRecentActivities = (prompts, users) => {
  const activities = [];
  
  // 从提示词数据生成活动
  const recentPrompts = prompts
    .sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime())
    .slice(0, 3);
  
  recentPrompts.forEach(prompt => {
    activities.push({
      id: `prompt_${prompt.id}`,
      title: "新提示词已提交",
      description: `用户 ${typeof prompt.author === 'object' ? prompt.author.name : (prompt.user ? prompt.user.name : '未知用户')} 提交了新的提示词 "${prompt.title}"`,
      time: `${Math.floor(Math.random() * 24)}小时前`,
      type: "new_prompt"
    });
  });
  
  // 根据提示词状态生成审核活动
  const reviewedPrompts = prompts
    .filter(p => p.status === '已通过' || p.status === 'approved' || p.status === '已拒绝' || p.status === 'rejected')
    .sort((a, b) => new Date(b.reviewed_at || b.date || b.created_at).getTime() - new Date(a.reviewed_at || a.date || a.created_at).getTime())
    .slice(0, 2);
  
  reviewedPrompts.forEach(prompt => {
    const isApproved = prompt.status === '已通过' || prompt.status === 'approved';
    activities.push({
      id: `review_${prompt.id}`,
      title: `提示词${isApproved ? '已通过' : '已拒绝'}`,
      description: `管理员审核${isApproved ? '通过' : '拒绝'}了提示词 "${prompt.title}"`,
      time: `${Math.floor(Math.random() * 12)}小时前`,
      type: isApproved ? "prompt_approved" : "prompt_rejected"
    });
  });
  
  return activities.sort(() => Math.random() - 0.5).slice(0, 5);
};

export async function GET(request: Request) {
  try {
    // 获取认证头
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromHeader(authHeader);

    // 检查权限
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { success: false, error: '权限不足，需要管理员权限' },
        { status: 403 }
      );
    }

    // 获取各种数据
    const prompts = await getPromptsData();
    const users = await getUsersData();
    const categories = await getCategoriesData();
    
    // 计算统计数据
    const totalPrompts = prompts.length;
    const totalUsers = users.length;
    const dailyVisits = getVisitData();
    
    // 计算待审核提示词数量
    const pendingReviews = prompts.filter(p => 
      p.status === '待审核' || 
      p.status === 'pending' || 
      p.status === 'review'
    ).length;
    
    // 计算分类分布
    const categoryPromptCounts = {};
    
    // 使用Supabase数据计算每个分类的提示词数量
    for (const prompt of prompts) {
      if (prompt.category) {
        const categoryName = typeof prompt.category === 'string' 
          ? prompt.category 
          : prompt.category.name;
        
        categoryPromptCounts[categoryName] = (categoryPromptCounts[categoryName] || 0) + 1;
      }
    }
    
    const categoryDistribution = categories.map(cat => {
      const count = categoryPromptCounts[cat.name] || 0;
      const percentage = totalPrompts > 0 ? Math.round((count / totalPrompts) * 100) : 0;
      return {
        name: cat.name,
        count: count,
        percentage: percentage
      };
    });
    
    // 获取最近活动
    const recentActivities = getRecentActivities(prompts, users);
    
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalPrompts,
          totalUsers,
          dailyVisits,
          pendingReviews
        },
        categoryDistribution,
        recentActivities
      }
    });
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取仪表盘数据失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 