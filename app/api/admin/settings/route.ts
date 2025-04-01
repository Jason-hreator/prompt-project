import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// 获取用户 ID 从请求头中
const getUserIdFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  // 从 token 中提取用户 ID
  const match = token.match(/mock_jwt_token_(\d+)/);
  return match ? match[1] : null;
};

// 检查用户是否为管理员
const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    // 使用Supabase获取用户
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
};

// 获取设置数据
const getSettingsData = async () => {
  try {
    // 使用Supabase获取设置
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .single();
    
    if (error || !settings) {
      // 如果获取失败或没有设置数据，返回默认设置
      console.log('未找到设置数据，使用默认设置');
      return getDefaultSettings();
    }
    
    return settings.data || getDefaultSettings();
  } catch (error) {
    console.error('读取设置数据失败:', error);
    return getDefaultSettings();
  }
};

// 保存设置数据
const saveSettingsData = async (settings: any): Promise<boolean> => {
  try {
    // 检查设置表中是否已有数据
    const { data: existingSettings, error: checkError } = await supabase
      .from('settings')
      .select('id')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116是"没有找到结果"的错误
      console.error('检查设置数据失败:', checkError);
      return false;
    }
    
    if (existingSettings) {
      // 更新现有设置
      const { error: updateError } = await supabase
        .from('settings')
        .update({ data: settings })
        .eq('id', existingSettings.id);
      
      if (updateError) {
        console.error('更新设置数据失败:', updateError);
        return false;
      }
    } else {
      // 创建新设置
      const { error: insertError } = await supabase
        .from('settings')
        .insert({ data: settings });
      
      if (insertError) {
        console.error('创建设置数据失败:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('保存设置数据失败:', error);
    return false;
  }
};

// 默认设置
const getDefaultSettings = () => {
  return {
    general: {
      site_name: '提示精灵',
      site_description: '提示精灵是一个分享和发现AI提示词的平台，帮助用户更高效地使用AI工具。',
      logo_url: '/images/logo.png',
      favicon_url: '/favicon.ico',
      primary_color: '#3B82F6',
    },
    registration: {
      allow_registration: true,
      require_email_verification: true,
      default_user_role: 'user',
      min_password_length: 8,
    },
    content: {
      content_moderation: true,
      allow_comments: true,
      max_prompts_per_day: 5,
      max_prompt_length: 5000,
    },
    email: {
      smtp_host: 'smtp.example.com',
      smtp_port: 587,
      smtp_username: 'noreply@example.com',
      smtp_password: '********',
      email_from: 'noreply@example.com',
    },
    api: {
      enable_api: true,
      api_rate_limit: 60,
      api_token_expiry: 30,
    },
  };
};

// GET 请求获取设置
export async function GET(request: Request) {
  try {
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

    // 获取设置数据
    const settings = await getSettingsData();

    // 隐藏敏感信息
    if (settings.email && settings.email.smtp_password) {
      settings.email.smtp_password = '********';
    }

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('获取设置时出错:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// PUT 请求更新设置
export async function PUT(request: Request) {
  try {
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

    // 获取请求体
    const requestData = await request.json();
    
    // 验证请求数据
    if (!requestData || typeof requestData !== 'object') {
      return NextResponse.json(
        { success: false, error: '无效的设置数据' },
        { status: 400 }
      );
    }

    // 获取当前设置
    const currentSettings = await getSettingsData();
    
    // 合并设置，递归更新
    const updatedSettings = mergeSettings(currentSettings, requestData);
    
    // 保存更新后的设置
    if (!(await saveSettingsData(updatedSettings))) {
      return NextResponse.json(
        { success: false, error: '保存设置失败' },
        { status: 500 }
      );
    }

    // 隐藏敏感信息
    if (updatedSettings.email && updatedSettings.email.smtp_password) {
      updatedSettings.email.smtp_password = '********';
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: '设置已成功更新'
    });
  } catch (error) {
    console.error('更新设置时出错:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// 递归合并设置对象
const mergeSettings = (target: any, source: any): any => {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeSettings(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
};

// 判断是否为对象
const isObject = (item: any): boolean => {
  return (item && typeof item === 'object' && !Array.isArray(item));
}; 