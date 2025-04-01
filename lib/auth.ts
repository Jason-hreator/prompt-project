import { supabase } from './supabase';

// 在已有的函数前添加Supabase认证方法
export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    return null;
  }

  if (data.user) {
    // 获取用户的详细信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return null;
    }

    // 存储用户数据到本地存储
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  }

  return null;
}

export async function registerWithEmail(email: string, password: string, userData: any) {
  // 创建Supabase认证用户
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Registration error:', error.message);
    return null;
  }

  if (data.user) {
    // 在users表中创建用户记录
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{
        ...userData,
        email,
        register_date: new Date().toISOString(),
        last_login: new Date().toISOString()
      }])
      .select()
      .single();

    if (userError) {
      console.error('Error creating user profile:', userError);
      return null;
    }

    // 存储用户数据到本地存储
    localStorage.setItem('user', JSON.stringify(newUser));
    
    return newUser;
  }

  return null;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Logout error:', error.message);
    return false;
  }
  
  // 清除本地存储的用户数据
  localStorage.removeItem('user');
  
  return true;
}

export async function getCurrentUser() {
  // 首先尝试从本地存储获取
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      localStorage.removeItem('user');
    }
  }
  
  // 如果本地存储没有，尝试从Supabase获取当前用户
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  // 获取用户的详细信息
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .single();
  
  if (userError) {
    console.error('Error fetching current user data:', userError);
    return null;
  }
  
  // 更新本地存储
  localStorage.setItem('user', JSON.stringify(userData));
  
  return userData;
}

// 兼容旧版登录系统
export async function login(email: string, password: string) {
  try {
    // 优先使用Supabase登录
    const user = await loginWithEmail(email, password);
    if (user) {
      return user;
    }
    
    // 如果Supabase登录失败，尝试使用旧系统登录逻辑
    // 这部分可以根据需要保留或删除
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export async function register(userData: any) {
  try {
    // 优先使用Supabase注册
    const user = await registerWithEmail(userData.email, userData.password, userData);
    if (user) {
      return user;
    }
    
    // 如果Supabase注册失败，尝试使用旧系统注册逻辑
    // 这部分可以根据需要保留或删除
    return null;
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
}

// 保留原有的本地存储认证方法
// ... existing code ... 