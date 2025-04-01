import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { getPrompts, deletePrompt, getUserById } from '../../../../lib/api.ts';

// 获取用户 ID 从请求头中
const getUserIdFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  // 从 token 中提取用户 ID
  // 模拟 token 格式: mock_jwt_token_{userId}
  const match = token.match(/mock_jwt_token_(\d+)/);
  return match ? match[1] : null;
};

// 检查用户是否为管理员
const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    // 使用Supabase获取用户信息
    const user = await getUserById(parseInt(userId));
    return user && user.role === 'admin';
  } catch (error) {
    console.error('检查管理员权限失败:', error);
    return false;
  }
};

// 检查用户是否有特定权限
const hasPermission = (userId: string, permission: string): boolean => {
  try {
    const user = getUserById(userId);
    if (!user) return false;
    
    // 如果是管理员，默认拥有所有权限
    if (user.role === 'admin') return true;
    
    // 检查特定权限
    const [category, action] = permission.split('.');
    return user.permissions?.[category]?.[action] === true;
  } catch (error) {
    console.error('检查权限失败:', error);
    return false;
  }
};

// GET 请求获取提示词列表
export async function GET(request: Request) {
  try {
    // 获取请求URL和参数
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const countOnly = searchParams.get('countOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
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

    // 使用Supabase获取提示词数据
    let query = supabase.from('prompts').select(`
      *,
      user:user_id (id, name, username, avatar)
    `);
    
    // 根据状态筛选
    if (status) {
      // 状态映射
      const statusMap = {
        'pending': ['pending', '待审核', 'pending', 'review', '审核中'],
        'approved': ['approved', '已通过', 'approved', 'published', '已发布'],
        'rejected': ['rejected', '已拒绝', 'rejected', 'denied', '已拒绝']
      };
      
      const targetStatuses = statusMap[status] || [status];
      query = query.in('status', targetStatuses);
    }
    
    // 获取总数
    const { count } = await query.count();
    
    // 如果只需要计数
    if (countOnly) {
      return NextResponse.json({
        success: true,
        count: count || 0
      });
    }
    
    // 排序和分页
    const { data: prompts, error } = await query
      .order('date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) {
      console.error('获取提示词失败:', error);
      return NextResponse.json(
        { success: false, error: '获取提示词失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prompts: prompts || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('获取提示词列表时出错:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// DELETE 请求删除提示词
export async function DELETE(request: Request) {
  try {
    // 获取请求URL和参数
    const { searchParams } = new URL(request.url);
    const promptId = parseInt(searchParams.get('id') || '');
    
    if (isNaN(promptId)) {
      return NextResponse.json(
        { success: false, error: '无效的提示词 ID' },
        { status: 400 }
      );
    }
    
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

    // 使用Supabase删除提示词
    const success = await deletePrompt(promptId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: '删除提示词失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '提示词已成功删除'
    });
  } catch (error) {
    console.error('删除提示词时出错:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 