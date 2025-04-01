import { NextResponse } from 'next/server';
import { toggleLike, getUserLikes, getPromptById, updatePrompt } from '../../../../../lib/api.ts';

// 检查用户是否已点赞
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const promptId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '缺少用户ID参数'
      }, { status: 400 });
    }
    
    // 获取用户点赞记录
    const userLikedPrompts = await getUserLikes(parseInt(userId));
    
    // 检查用户是否已点赞该提示词
    const isLiked = userLikedPrompts.includes(parseInt(promptId));
    
    return NextResponse.json({
      success: true,
      liked: isLiked
    });
  } catch (error) {
    console.error('获取点赞状态失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取点赞状态失败: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

// 点赞或取消点赞
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('处理点赞请求，提示词ID:', params.id);
    
    const promptId = parseInt(params.id);
    const body = await request.json();
    const userId = body.userId ? parseInt(body.userId) : null;
    
    console.log('用户ID:', userId);
    
    // 验证提示词ID
    if (!promptId) {
      return NextResponse.json({
        success: false,
        error: '缺少提示词ID参数'
      }, { status: 400 });
    }
    
    // 验证用户ID
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '缺少用户ID'
      }, { status: 400 });
    }
    
    // 查找提示词
    const prompt = await getPromptById(promptId);
    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: '未找到提示词'
      }, { status: 404 });
    }
    
    console.log('找到提示词:', prompt.title);
    
    // 使用Supabase切换点赞状态
    const liked = await toggleLike(userId, promptId);
    
    // 更新提示词的点赞计数
    // 获取当前用户点赞
    const userLikedPrompts = await getUserLikes(userId);
    const isLiked = userLikedPrompts.includes(promptId);
    
    // 如果点赞状态发生变化，更新提示词点赞数
    const updatedLikes = isLiked ? (prompt.likes || 0) + 1 : Math.max(0, (prompt.likes || 0) - 1);
    
    // 更新提示词点赞数
    await updatePrompt(promptId, { likes: updatedLikes });
    
    console.log('点赞操作完成，当前点赞数:', updatedLikes);
    
    return NextResponse.json({
      success: true,
      liked: isLiked,
      likeCount: updatedLikes
    });
  } catch (error) {
    console.error('处理点赞请求失败:', error);
    return NextResponse.json({
      success: false,
      error: '处理点赞请求失败: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 