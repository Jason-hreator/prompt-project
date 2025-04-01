import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcrypt';

// 开发环境是否需要邮箱验证
const DEV_SKIP_EMAIL_VERIFICATION = true;

export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await request.json();
    const { name, email, password } = body;
    
    // 基本输入验证
    if (!name || !email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: '请填写所有必填字段' 
      }, { status: 400 });
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: '请输入有效的邮箱地址'
      }, { status: 400 });
    }
    
    // 密码长度验证
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: '密码长度必须至少为6个字符'
      }, { status: 400 });
    }
    
    // 开发环境中是否跳过邮箱验证
    const needsEmailConfirmation = process.env.NODE_ENV === 'production' || !DEV_SKIP_EMAIL_VERIFICATION;
    
    try {
      // 使用Supabase Auth注册用户
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/auth/callback`,
        }
      });
      
      if (error) {
        console.error('Supabase注册错误:', error);
        
        // 根据错误类型提供友好的错误信息
        let errorMessage = '注册失败';
        
        if (error.message.includes('already registered')) {
          errorMessage = '该邮箱已被注册，请使用其他邮箱或尝试找回密码';
        } else if (error.message.includes('password')) {
          errorMessage = '密码不符合要求，请使用包含字母和数字的组合';
        } else if (error.message.includes('network') || error.message.includes('fetch failed')) {
          errorMessage = '网络连接问题，请检查您的网络设置并稍后重试';
        } else {
          errorMessage = `注册失败: ${error.message}`;
        }
        
        return NextResponse.json({
          success: false,
          error: errorMessage
        }, { status: 400 });
      }
      
      if (!data.user) {
        return NextResponse.json({
          success: false,
          error: '创建用户失败'
        }, { status: 500 });
      }
      
      // 创建用户信息到数据库
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            name,
            email,
            role: 'user',
            register_date: new Date().toISOString()
          }
        ]);
      
      if (profileError) {
        console.error('创建用户资料失败:', profileError);
        // 注意: 即使用户资料创建失败，auth用户已创建成功，所以不返回错误
      }
      
      return NextResponse.json({
        success: true,
        message: needsEmailConfirmation 
          ? '注册成功，请检查您的邮箱并点击确认链接激活账号' 
          : '注册成功',
        needsEmailConfirmation,
        user: {
          id: data.user.id,
          email: data.user.email,
          name
        }
      });
      
    } catch (error) {
      console.error('注册失败:', error);
      
      let errorMessage = '注册过程中出现问题，请稍后重试';
      if (error instanceof Error) {
        // 网络连接问题特殊处理
        if (error.message.includes('ENOTFOUND') || error.message.includes('fetch failed')) {
          errorMessage = '无法连接到认证服务器，请检查您的网络连接';
        } else {
          errorMessage = `注册失败: ${error.message}`;
        }
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('处理注册请求时出错:', error);
    
    return NextResponse.json({
      success: false,
      error: '服务器处理请求时出错'
    }, { status: 500 });
  }
}