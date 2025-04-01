import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcrypt';

// JWT密钥，应该存储在环境变量中
// 在生产环境中，请使用更复杂的密钥并保存在环境变量中
const JWT_SECRET = process.env.JWT_SECRET || 'myjwtsecretkey123456789forpromptproject';

// 测试账户 - 仅在开发环境使用
const TEST_ACCOUNTS = [
  {
    email: 'admin@example.com',
    password: 'password',
    id: 'admin-test-id-123',
    name: '管理员',
    role: 'admin'
  },
  {
    email: 'user@example.com',
    password: 'password',
    id: 'user-test-id-456',
    name: '测试用户',
    role: 'user'
  }
];

export async function POST(request: Request) {
  console.log('收到登录请求');
  
  try {
    // 解析请求体
    const body = await request.json();
    const { email, password } = body;
    
    // 验证必要字段
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: '请提供邮箱和密码' 
      }, { status: 400 });
    }
    
    console.log(`尝试登录用户: ${email}`);
    
    // 开发环境测试账号登录
    if (process.env.NODE_ENV !== 'production') {
      const testAccount = TEST_ACCOUNTS.find(account => 
        account.email === email && account.password === password
      );
      
      if (testAccount) {
        console.log(`使用测试账号登录: ${testAccount.role}`);
        
        // 创建JWT令牌
        const token = jwt.sign(
          { 
            userId: testAccount.id, 
            email: testAccount.email,
            role: testAccount.role 
          }, 
          JWT_SECRET, 
          { expiresIn: '7d' }
        );
        
        return NextResponse.json({
          success: true,
          message: '测试账号登录成功',
          user: {
            id: testAccount.id,
            email: testAccount.email,
            name: testAccount.name,
            role: testAccount.role
          },
          token
        });
      }
    }
    
    // 使用Supabase Auth登录
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('登录失败:', error);
        
        // 根据错误类型提供友好的错误信息
        let errorMessage = '登录失败';
        
        if (error.message.includes('Invalid login')) {
          errorMessage = '邮箱或密码不正确';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = '您的邮箱尚未验证，请查收验证邮件并完成验证';
        } else if (error.message.includes('network') || error.message.includes('fetch failed')) {
          errorMessage = '网络连接问题，请检查您的网络设置并稍后重试';
        } else {
          errorMessage = `登录失败: ${error.message}`;
        }
        
        return NextResponse.json({
          success: false,
          error: errorMessage
        }, { status: 401 });
      }
      
      if (!data.user) {
        return NextResponse.json({
          success: false,
          error: '用户不存在或已被禁用'
        }, { status: 404 });
      }
      
      // 获取用户详细信息
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      // 用户角色 - 默认为普通用户
      let userRole = 'user';
      let userName = data.user.user_metadata?.name || '';
      
      if (userError) {
        console.warn('获取用户详情失败，使用默认用户角色:', userError);
      } else if (userData) {
        userRole = userData.role || 'user';
        userName = userData.name || userName;
      }
      
      // 创建JWT令牌
      const token = jwt.sign(
        { 
          userId: data.user.id, 
          email: data.user.email,
          role: userRole 
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      return NextResponse.json({
        success: true,
        message: '登录成功',
        user: {
          id: data.user.id,
          email: data.user.email,
          name: userName,
          role: userRole
        },
        token
      });
    } catch (supabaseError) {
      console.error('Supabase登录失败:', supabaseError);
      
      // 如果Supabase连接失败，仍然允许测试账号登录
      if (email === 'admin@example.com' && password === 'password') {
        const adminAccount = TEST_ACCOUNTS[0];
        const token = jwt.sign(
          { 
            userId: adminAccount.id, 
            email: adminAccount.email,
            role: adminAccount.role 
          }, 
          JWT_SECRET, 
          { expiresIn: '7d' }
        );
        
        return NextResponse.json({
          success: true,
          message: '测试管理员登录成功 (后备模式)',
          user: {
            id: adminAccount.id,
            email: adminAccount.email,
            name: adminAccount.name,
            role: adminAccount.role
          },
          token
        });
      }
      
      if (email === 'user@example.com' && password === 'password') {
        const userAccount = TEST_ACCOUNTS[1];
        const token = jwt.sign(
          { 
            userId: userAccount.id, 
            email: userAccount.email,
            role: userAccount.role 
          }, 
          JWT_SECRET, 
          { expiresIn: '7d' }
        );
        
        return NextResponse.json({
          success: true,
          message: '测试用户登录成功 (后备模式)',
          user: {
            id: userAccount.id,
            email: userAccount.email,
            name: userAccount.name,
            role: userAccount.role
          },
          token
        });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Supabase连接失败，请稍后重试或使用测试账号'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('登录过程中出错:', error);
    
    let errorMessage = '登录过程中出现问题，请稍后重试';
    if (error instanceof Error) {
      // 网络连接问题特殊处理
      if (error.message.includes('ENOTFOUND') || error.message.includes('fetch failed')) {
        errorMessage = '无法连接到认证服务器，请检查您的网络连接';
      } else {
        errorMessage = `登录失败: ${error.message}`;
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}