import { NextRequest, NextResponse } from "next/server";
import { supabase } from '../../../../lib/supabase';

// 从请求头中获取用户ID
function getUserIdFromHeader(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    
    const token = authHeader.split(' ')[1];
    // 模拟从token中获取用户ID的逻辑
    const userId = token.split('_').pop();
    return userId;
  } catch (error) {
    console.error('从请求头获取用户ID失败:', error);
    return null;
  }
}

// 检查用户是否为管理员
async function isAdmin(userId: string) {
  try {
    // 使用Supabase查询用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !user) {
      return false;
    }
    
    return user.role === 'admin';
  } catch (error) {
    console.error('检查管理员权限失败:', error);
    return false;
  }
}

// 查询用户数据
async function getUsersData() {
  try {
    // 使用Supabase获取所有用户
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('获取用户数据失败:', error);
      throw new Error('获取用户数据失败');
    }
    
    return users || [];
  } catch (error) {
    console.error('获取用户数据失败:', error);
    throw new Error('获取用户数据失败');
  }
}

// 保存用户数据
async function saveUserData(user: any) {
  try {
    if (user.id) {
      // 更新现有用户
      const { data, error } = await supabase
        .from('users')
        .update(user)
        .eq('id', user.id)
        .select();
      
      if (error) {
        console.error('更新用户数据失败:', error);
        throw new Error('更新用户数据失败');
      }
      
      return data?.[0];
    } else {
      // 创建新用户
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select();
      
      if (error) {
        console.error('创建用户数据失败:', error);
        throw new Error('创建用户数据失败');
      }
      
      return data?.[0];
    }
  } catch (error) {
    console.error('保存用户数据失败:', error);
    throw new Error('保存用户数据失败');
  }
}

// 删除用户
async function deleteUser(userId: number) {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('删除用户失败:', error);
      throw new Error('删除用户失败');
    }
    
    return true;
  } catch (error) {
    console.error('删除用户失败:', error);
    throw new Error('删除用户失败');
  }
}

// GET 请求处理 - 获取所有用户
export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromHeader(req);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }
    
    const adminCheck = await isAdmin(userId);
    
    if (!adminCheck) {
      return NextResponse.json(
        { success: false, error: '需要管理员权限' },
        { status: 403 }
      );
    }
    
    const users = await getUsersData();
    
    // 从用户数据中移除密码字段
    const safeUsers = users.map(({ password, ...user }: any) => user);
    
    return NextResponse.json({ success: true, users: safeUsers });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取用户列表失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// POST 请求处理 - 创建新用户
export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromHeader(req);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }
    
    const adminCheck = await isAdmin(userId);
    
    if (!adminCheck) {
      return NextResponse.json(
        { success: false, error: '需要管理员权限' },
        { status: 403 }
      );
    }
    
    const { username, name, email, password, role, permissions } = await req.json();
    
    // 验证必填字段
    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: '缺少必要字段' },
        { status: 400 }
      );
    }
    
    // 检查邮箱是否已被使用
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (checkError) {
      console.error('检查邮箱是否被使用时出错:', checkError);
      return NextResponse.json(
        { success: false, error: '检查邮箱是否被使用时出错' },
        { status: 500 }
      );
    }
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '邮箱已被使用' },
        { status: 400 }
      );
    }
    
    // 创建新用户
    const newUser = {
      username,
      name: name || username,
      email,
      password,
      role,
      permissions: permissions || getDefaultPermissions(role),
      created_at: new Date().toISOString(),
      last_login: null
    };
    
    const savedUser = await saveUserData(newUser);
    
    if (!savedUser) {
      return NextResponse.json(
        { success: false, error: '创建用户失败' },
        { status: 500 }
      );
    }
    
    const { password: _, ...safeUser } = savedUser;
    
    return NextResponse.json(
      { success: true, user: safeUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json(
      { success: false, error: '创建用户失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// PUT 请求处理 - 更新用户
export async function PUT(req: NextRequest) {
  try {
    const userId = getUserIdFromHeader(req);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }
    
    const adminCheck = await isAdmin(userId);
    
    if (!adminCheck) {
      return NextResponse.json(
        { success: false, error: '需要管理员权限' },
        { status: 403 }
      );
    }
    
    const { id, username, name, email, password, role, permissions } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }
    
    // 检查用户是否存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (checkError || !existingUser) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 检查邮箱是否已被其他用户使用
    if (email && email !== existingUser.email) {
      const { data: emailUser, error: emailError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .maybeSingle();
      
      if (emailError) {
        console.error('检查邮箱是否被使用时出错:', emailError);
        return NextResponse.json(
          { success: false, error: '检查邮箱是否被使用时出错' },
          { status: 500 }
        );
      }
      
      if (emailUser) {
        return NextResponse.json(
          { success: false, error: '邮箱已被其他用户使用' },
          { status: 400 }
        );
      }
    }
    
    // 更新用户数据
    const updatedUser = {
      ...existingUser,
      username: username || existingUser.username,
      name: name || existingUser.name,
      email: email || existingUser.email,
      ...(password ? { password } : {}),
      role: role || existingUser.role,
      permissions: permissions || existingUser.permissions
    };
    
    const savedUser = await saveUserData(updatedUser);
    
    if (!savedUser) {
      return NextResponse.json(
        { success: false, error: '更新用户失败' },
        { status: 500 }
      );
    }
    
    const { password: _, ...safeUser } = savedUser;
    
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('更新用户失败:', error);
    return NextResponse.json(
      { success: false, error: '更新用户失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// DELETE 请求处理 - 删除用户
export async function DELETE(req: NextRequest) {
  try {
    const userId = getUserIdFromHeader(req);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }
    
    const adminCheck = await isAdmin(userId);
    
    if (!adminCheck) {
      return NextResponse.json(
        { success: false, error: '需要管理员权限' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('id');
    
    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }
    
    // 检查是否删除自己
    if (targetUserId === userId) {
      return NextResponse.json(
        { success: false, error: '不能删除自己的账户' },
        { status: 400 }
      );
    }
    
    const success = await deleteUser(parseInt(targetUserId));
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: '删除用户失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, message: '用户已删除' });
  } catch (error) {
    console.error('删除用户失败:', error);
    return NextResponse.json(
      { success: false, error: '删除用户失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// 获取默认权限
function getDefaultPermissions(role: string) {
  if (role === 'admin') {
    return {
      prompts: {
        create: true,
        delete: true,
        deleteAny: true,
        edit: true,
        editAny: true,
        review: true,
        manage: true
      },
      comments: {
        create: true,
        delete: true,
        deleteAny: true,
        manage: true
      },
      users: {
        view: true,
        delete: true,
        edit: true,
        assign: true,
        ban: true
      },
      system: {
        settings: true,
        categories: true,
        colors: true,
        analytics: true,
        logs: true
      }
    };
  }
  
  // 默认普通用户权限
  return {
    prompts: {
      create: true,
      delete: true,
      deleteAny: false,
      edit: true,
      editAny: false,
      review: false,
      manage: false
    },
    comments: {
      create: true,
      delete: true,
      deleteAny: false,
      manage: false
    },
    users: {
      view: false,
      delete: false,
      edit: false,
      assign: false,
      ban: false
    },
    system: {
      settings: false,
      categories: false,
      colors: false,
      analytics: false,
      logs: false
    }
  };
} 