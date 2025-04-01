import { NextResponse } from 'next/server';
import { getPromptsByUserId, deletePrompt } from '../../../../lib/api.ts';

// 从请求头中获取用户ID
function getUserIdFromHeader(request: Request): number | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  // 假设格式是 Bearer mock_jwt_token_1，我们需要提取最后的数字
  const match = authHeader.match(/mock_jwt_token_(\d+)/);
  if (!match) return null;
  
  return parseInt(match[1]);
}

// 获取用户提交的提示词
export async function GET(request: Request) {
  try {
    // 从请求头或URL参数中获取用户ID
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    
    // 如果URL参数中没有userId，则从认证头中获取
    if (!userId) {
      const headerUserId = getUserIdFromHeader(request);
      if (!headerUserId) {
        return NextResponse.json({
          success: false,
          error: '未提供用户ID'
        }, { status: 400 });
      }
      userId = headerUserId.toString();
    }
    
    // 获取分页参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || null; // 可选的状态过滤
    
    // 使用Supabase获取用户提示词
    const userPrompts = await getPromptsByUserId(parseInt(userId), status);
    
    // 计算分页
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPrompts = userPrompts.slice(startIndex, endIndex);
    
    // 提取需要的字段，不暴露敏感信息
    const safePrompts = paginatedPrompts.map(prompt => ({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      description: prompt.description || '',
      category: prompt.category,
      model: prompt.model,
      author: prompt.author,
      status: prompt.status,
      date: prompt.date,
      likes: prompt.likes
    }));
    
    return NextResponse.json({
      success: true,
      prompts: safePrompts,
      total: userPrompts.length,
      page,
      limit,
      totalPages: Math.ceil(userPrompts.length / limit)
    });
    
  } catch (error) {
    console.error('获取用户提示词失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取用户提示词失败: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

// 撤回提示词
export async function DELETE(request: Request) {
  try {
    // 获取用户ID和提示词ID
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('id');
    
    if (!promptId) {
      return NextResponse.json({
        success: false,
        error: '未提供提示词ID'
      }, { status: 400 });
    }
    
    const userId = getUserIdFromHeader(request);
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '未授权'
      }, { status: 401 });
    }
    
    // 使用Supabase删除提示词
    // 注意：由于RLS策略，只有当用户是提示词创建者时才能删除
    const success = await deletePrompt(parseInt(promptId));
    
    if (!success) {
      return NextResponse.json({
        success: false,
        error: '提示词不存在或您无权操作'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: '提示词已成功撤回'
    });
    
  } catch (error) {
    console.error('撤回提示词失败:', error);
    return NextResponse.json({
      success: false,
      error: '撤回提示词失败: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 