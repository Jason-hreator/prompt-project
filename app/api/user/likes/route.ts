import { NextResponse } from 'next/server';
import { getUserLikes, getPromptsByIds } from '../../../../lib/api.ts';

// 获取用户喜欢的提示词列表
export async function GET(request: Request) {
  try {
    console.log('获取用户点赞列表API被调用');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log('用户ID:', userId);
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '缺少用户ID参数'
      }, { status: 400 });
    }
    
    // 使用Supabase获取用户的点赞记录
    const userLikedPromptIds = await getUserLikes(parseInt(userId));
    console.log('该用户点赞的提示词ID:', userLikedPromptIds);
    
    if (userLikedPromptIds.length === 0) {
      return NextResponse.json({
        success: true,
        prompts: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      });
    }
    
    // 使用Supabase根据ID列表获取提示词详情
    const likedPrompts = await getPromptsByIds(userLikedPromptIds);
    console.log('找到用户点赞的提示词数量:', likedPrompts.length);
    
    // 提取需要的字段
    const mappedPrompts = likedPrompts.map(prompt => ({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      description: prompt.description || '',
      category: prompt.category,
      model: prompt.model || 'ChatGPT',
      author: prompt.author?.name || '匿名',
      status: prompt.status,
      date: prompt.date || prompt.createdAt,
      likes: prompt.likes || 0
    }));
    
    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPrompts = mappedPrompts.slice(startIndex, endIndex);
    
    return NextResponse.json({
      success: true,
      prompts: paginatedPrompts,
      total: mappedPrompts.length,
      page,
      limit,
      totalPages: Math.ceil(mappedPrompts.length / limit)
    });
  } catch (error) {
    console.error('获取用户喜欢的提示词失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取用户喜欢的提示词失败: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 