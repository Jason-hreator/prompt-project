import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { getUserById } from '../../../../lib/api.ts';

// 从请求头中获取用户ID
function getUserIdFromHeader(request: Request): number | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  // 假设格式是 Bearer mock_jwt_token_1，我们需要提取最后的数字
  const match = authHeader.match(/mock_jwt_token_(\d+)/);
  if (!match) return null;
  
  return parseInt(match[1]);
}

// 获取当前登录用户的信息
export async function GET(request: Request) {
  try {
    // 从请求头获取用户ID
    const userId = getUserIdFromHeader(request);
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '未授权'
      }, { status: 401 });
    }
    
    // 使用Supabase获取用户数据
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: '用户不存在'
      }, { status: 404 });
    }
    
    // 返回用户信息(不包含密码)
    const { password: _, ...safeUserData } = user;
    
    return NextResponse.json({
      success: true,
      user: safeUserData
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取用户信息失败: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 