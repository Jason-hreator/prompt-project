// 提示词数据同步脚本
const { createClient } = require('@supabase/supabase-js');

// Supabase连接配置
const supabaseUrl = 'https://tzsmhrvusihuoqbifmpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c21ocnZ1c2lodW9xYmlmbXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDQxMDAsImV4cCI6MjA1Nzk4MDEwMH0.K6emfisOYmQfbChpheYAFQjYS01o-UY0nMYacN_H8nM';

const supabase = createClient(supabaseUrl, supabaseKey);

// 查询并显示Supabase中的提示词
async function checkPrompts() {
  try {
    console.log('正在查询Supabase中的提示词...');
    
    // 查询所有提示词
    const { data: prompts, error } = await supabase
      .from('prompts')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('查询提示词出错:', error);
      return;
    }
    
    if (!prompts || prompts.length === 0) {
      console.log('数据库中没有提示词记录');
      return;
    }
    
    console.log(`数据库中共有 ${prompts.length} 条提示词记录：`);
    prompts.forEach(prompt => {
      console.log(`- ID: ${prompt.id}, 标题: ${prompt.title}, 分类: ${prompt.category}`);
    });
    
    // 前端展示的提示词ID，根据用户提供的图片，可能有1, 2, 3三个ID
    const frontendPromptIds = [1, 2, 3]; // 这里假设前端展示的是这三个ID的提示词
    
    // 数据库中存在的提示词ID
    const dbPromptIds = prompts.map(p => p.id);
    
    // 找出前端展示但数据库中不存在的提示词ID
    const nonExistentIds = frontendPromptIds.filter(id => !dbPromptIds.includes(id));
    
    if (nonExistentIds.length > 0) {
      console.log(`发现 ${nonExistentIds.length} 个前端展示但数据库中不存在的提示词ID:`, nonExistentIds);
      
      // 这里可以执行删除操作，但我们先不执行，只打印出来
      console.log('需要从前端删除的提示词ID:', nonExistentIds);
    } else {
      console.log('所有前端展示的提示词在数据库中都存在');
    }
  } catch (error) {
    console.error('检查提示词时出错:', error);
  }
}

// 运行检查
checkPrompts(); 