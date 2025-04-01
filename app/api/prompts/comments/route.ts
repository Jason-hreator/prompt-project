import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { getCommentsByPromptId, createComment, deleteComment, getUserById } from '../../../../lib/api.ts';

// 验证token
async function verifyToken(token) {
  try {
    // 从token获取用户ID (模拟token格式: mock_jwt_token_{userId})
    const match = token.match(/mock_jwt_token_(\d+)/);
    if (!match) {
      return null;
    }
    
    const userId = match[1];
    // 使用Supabase获取用户
    const user = await getUserById(userId);
    
    if (!user) {
      return null;
    }
    
    return { user };
  } catch (error) {
    console.error('验证token失败:', error);
    return null;
  }
}

// 获取评论列表
export async function GET(request: Request) {
  try {
    console.log('获取评论列表API被调用');
    
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('promptId');
    const isAdmin = searchParams.get('admin') === 'true';
    
    console.log('参数:', { promptId, isAdmin });
    
    // 如果是管理员且未指定promptId，返回所有评论
    if (isAdmin && !promptId) {
      // 检查权限
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
      }
      
      const token = authHeader.split(' ')[1];
      const payload = await verifyToken(token);
      
      if (!payload || !payload.user || payload.user.role !== 'admin') {
        return NextResponse.json({ success: false, error: '权限不足，需要管理员权限' }, { status: 403 });
      }
      
      console.log('管理员获取所有评论');
      
      // 使用Supabase获取所有评论
      const { data: comments, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id (id, name, username, avatar)
        `)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('获取评论失败:', error);
        return NextResponse.json({
          success: false,
          error: '获取评论失败'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        comments: comments
      });
    }
    
    // 常规用户必须指定promptId
    if (!promptId) {
      return NextResponse.json({
        success: false,
        error: '缺少提示词ID参数'
      }, { status: 400 });
    }
    
    // 使用Supabase获取特定提示词的评论
    const comments = await getCommentsByPromptId(parseInt(promptId));
    console.log(`找到提示词 ${promptId} 的评论 ${comments.length} 条`);
    
    return NextResponse.json({
      success: true,
      comments: comments
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取评论失败: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

// 添加评论
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { promptId, userId, userName, content } = body;
    
    // 验证请求参数
    if (!promptId) {
      return NextResponse.json({
        success: false,
        error: '缺少提示词ID参数'
      }, { status: 400 });
    }
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '缺少用户ID参数'
      }, { status: 401 });
    }
    
    if (!content || content.trim() === '') {
      return NextResponse.json({
        success: false,
        error: '评论内容不能为空'
      }, { status: 400 });
    }
    
    // 创建评论数据对象
    const commentData = {
      promptId: parseInt(promptId),
      userId: parseInt(userId),
      content: content.trim()
    };
    
    // 使用Supabase创建评论
    const newComment = await createComment(commentData);
    
    if (!newComment) {
      return NextResponse.json({
        success: false,
        error: '保存评论数据失败'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      comment: newComment
    });
  } catch (error) {
    console.error('添加评论失败:', error);
    return NextResponse.json({
      success: false,
      error: '添加评论失败: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

// 删除或更新评论状态
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');
    
    if (!commentId) {
      return NextResponse.json({
        success: false,
        error: '缺少评论ID参数'
      }, { status: 400 });
    }
    
    // 权限检查
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    
    if (!payload || !payload.user || payload.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: '权限不足，需要管理员权限' }, { status: 403 });
    }
    
    // 使用Supabase删除评论
    const success = await deleteComment(parseInt(commentId));
    
    if (!success) {
      return NextResponse.json({
        success: false,
        error: '删除评论失败'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: '评论已删除'
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    return NextResponse.json({
      success: false,
      error: '删除评论失败: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 