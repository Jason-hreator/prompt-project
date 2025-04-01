import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// 默认分类数据（备用）
const DEFAULT_CATEGORIES = [
  {
    id: 1,
    name: '创意生成型',
    description: '用于创作、设计和灵感激发的提示词',
    icon: '/icons/creative.svg',
    prompt_count: 5
  },
  {
    id: 2,
    name: '学习辅助型',
    description: '帮助学习、整理笔记和学术研究的提示词',
    icon: '/icons/learning.svg',
    prompt_count: 8
  },
  {
    id: 3,
    name: '工作效率型',
    description: '提高工作效率、总结文本和处理数据的提示词',
    icon: '/icons/productivity.svg',
    prompt_count: 6
  },
  {
    id: 4,
    name: '编程开发型',
    description: '辅助编程、调试代码和技术文档的提示词',
    icon: '/icons/coding.svg',
    prompt_count: 4
  },
  {
    id: 5,
    name: '生活助手型',
    description: '日常生活、健康饮食和个人管理的提示词',
    icon: '/icons/lifestyle.svg',
    prompt_count: 3
  }
];

export async function GET() {
  try {
    // 尝试从Supabase获取分类
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('从Supabase获取分类时出错:', error);
      // 发生错误时返回默认分类
      return NextResponse.json({
        success: true,
        data: DEFAULT_CATEGORIES,
        source: 'default'
      });
    }
    
    if (!categories || categories.length === 0) {
      console.log('Supabase中没有分类数据，使用默认分类');
      return NextResponse.json({
        success: true,
        data: DEFAULT_CATEGORIES,
        source: 'default'
      });
    }
    
    return NextResponse.json({
      success: true,
      data: categories,
      source: 'database'
    });
    
  } catch (error) {
    console.error('获取分类时出错:', error);
    // 出现任何错误时返回默认分类
    return NextResponse.json({
      success: true,
      data: DEFAULT_CATEGORIES,
      source: 'default',
      error: '获取分类失败，使用默认数据'
    });
  }
}