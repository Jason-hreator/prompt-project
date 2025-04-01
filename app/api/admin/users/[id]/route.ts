import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    console.log(`获取用户详情，ID: ${id}`);
    
    if (isNaN(id)) {
      console.error(`无效的用户ID: ${params.id}`);
      return NextResponse.json(
        { success: false, error: '无效的用户ID' },
        { status: 400 }
      );
    }
    
    // 使用Supabase获取用户数据
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !user) {
      console.error(`未找到ID为${id}的用户`, error);
      return NextResponse.json(
        { success: false, error: '未找到用户' },
        { status: 404 }
      );
    }
    
    console.log(`成功获取用户详情: ${user.name}`);
    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取用户详情失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    console.log(`更新用户信息，ID: ${id}`);
    
    if (isNaN(id)) {
      console.error(`无效的用户ID: ${params.id}`);
      return NextResponse.json(
        { success: false, error: '无效的用户ID' },
        { status: 400 }
      );
    }
    
    // 检查用户是否存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (checkError || !existingUser) {
      console.error(`未找到ID为${id}的用户`);
      return NextResponse.json(
        { success: false, error: '未找到用户' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    console.log('更新用户的数据:', data);
    
    // 验证必填字段
    if (!data.name || !data.email || !data.role || !data.status) {
      console.error('缺少必要的字段');
      return NextResponse.json(
        { success: false, error: '缺少必要的字段(姓名、邮箱、角色、状态)' },
        { status: 400 }
      );
    }
    
    // 更新用户数据
    const updateData = {
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      bio: data.bio || '',
      website: data.website || '',
      location: data.location || '',
      avatar: data.avatar || ''
    };
    
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError || !updatedUser) {
      console.error(`更新失败，可能是用户ID ${id} 不存在`, updateError);
      return NextResponse.json(
        { success: false, error: '更新用户失败' },
        { status: 500 }
      );
    }
    
    console.log(`成功更新用户: ${updatedUser.name}`);
    return NextResponse.json({
      success: true,
      message: '用户信息已成功更新',
      data: updatedUser
    });
  } catch (error) {
    console.error('更新用户失败:', error);
    return NextResponse.json(
      { success: false, error: '更新用户失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 