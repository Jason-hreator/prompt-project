// 直接导入dotenv包而不是使用dotenv/config
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 从环境变量中获取Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少Supabase配置，请检查环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncAdminAccount() {
  try {
    console.log("开始同步管理员账号...");
    console.log("使用Supabase URL:", supabaseUrl);
    
    // 1. 通过Auth API创建用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@example.com',
      password: 'password',
    });
    
    if (authError) {
      // 如果用户已存在，尝试更新角色
      if (authError.message.includes('User already registered')) {
        console.log("管理员Auth账号已存在，尝试登录");
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@example.com',
          password: 'password',
        });
        
        if (signInError) {
          throw new Error(`管理员账号登录失败: ${signInError.message}`);
        }
        
        // 检查users表中是否有此用户
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('*')
          .eq('email', 'admin@example.com')
          .single();
          
        if (checkError && !checkError.message.includes('No rows found')) {
          throw new Error(`检查用户失败: ${checkError.message}`);
        }
        
        if (existingUser) {
          console.log("更新管理员角色");
          
          // 更新为管理员角色
          const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('email', 'admin@example.com');
            
          if (updateError) {
            throw new Error(`更新管理员角色失败: ${updateError.message}`);
          }
          
          console.log("管理员角色更新成功");
        } else {
          console.log("在users表中创建管理员记录");
          
          // 创建用户资料
          const { error: insertError } = await supabase
            .from('users')
            .insert([{
              id: signInData.user?.id,
              name: '管理员',
              email: 'admin@example.com',
              role: 'admin',
              register_date: new Date().toISOString()
            }]);
            
          if (insertError) {
            throw new Error(`创建管理员用户资料失败: ${insertError.message}`);
          }
          
          console.log("管理员用户资料创建成功");
        }
      } else {
        throw new Error(`创建Auth用户失败: ${authError.message}`);
      }
    } else {
      console.log("Auth账号创建成功，创建用户资料");
      
      // 创建用户资料
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: authData.user?.id,
          name: '管理员',
          email: 'admin@example.com',
          role: 'admin',
          register_date: new Date().toISOString()
        }]);
        
      if (insertError) {
        throw new Error(`创建用户资料失败: ${insertError.message}`);
      }
    }
    
    console.log("管理员账号同步完成!");
  } catch (error) {
    console.error("同步管理员账号失败:", error);
  }
}

// 执行同步
syncAdminAccount();