import { NextResponse } from 'next/server';
import { updatePrompt } from '@/lib/api';

export async function POST(request: Request) {
  try {
    // 解析请求体
    const { promptId, featured } = await request.json();
    
    if (!promptId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少提示词ID' 
      }, { status: 400 });
    }
    
    console.log(`${featured ? '设置' : '取消'}提示词 ${promptId} 为精选`);
    
    // 更新提示词精选状态
    const success = await updatePrompt(promptId, {
      is_featured: !!featured
    });
    
    if (!success) {
      throw new Error('更新提示词失败');
    }
    
    return NextResponse.json({ 
      success: true,
      message: featured ? '已将提示词设为精选' : '已取消提示词的精选状态'
    });
    
  } catch (error) {
    console.error('更改精选状态时出错:', error);
    
    return NextResponse.json({ 
      success: false,
      error: '服务器处理请求时出错' 
    }, { status: 500 });
  }
}