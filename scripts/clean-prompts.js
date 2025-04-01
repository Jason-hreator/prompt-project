// 提示词数据清理同步脚本
const { createClient } = require('@supabase/supabase-js');

// Supabase连接配置
const supabaseUrl = 'https://tzsmhrvusihuoqbifmpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c21ocnZ1c2lodW9xYmlmbXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDQxMDAsImV4cCI6MjA1Nzk4MDEwMH0.K6emfisOYmQfbChpheYAFQjYS01o-UY0nMYacN_H8nM';

const supabase = createClient(supabaseUrl, supabaseKey);

// 需要被删除的提示词ID (根据前面的查询，只有ID为3的提示词需要删除)
const promptIdsToRemove = [3];

// 清理数据库中的提示词
async function cleanPrompts() {
  try {
    console.log('开始清理Supabase中的提示词数据...');
    
    // 先查询当前的提示词
    const { data: prompts, error: queryError } = await supabase
      .from('prompts')
      .select('id, title')
      .order('id');
    
    if (queryError) {
      console.error('查询提示词出错:', queryError);
      return;
    }
    
    console.log('当前数据库中的提示词:');
    prompts.forEach(prompt => {
      console.log(`- ID: ${prompt.id}, 标题: ${prompt.title}`);
    });
    
    // 过滤出实际需要删除的ID (确保这些ID在数据库中存在)
    const idsToRemove = promptIdsToRemove.filter(id => 
      prompts.some(prompt => prompt.id === id)
    );
    
    if (idsToRemove.length === 0) {
      console.log('没有需要删除的提示词');
      return;
    }
    
    console.log(`准备删除以下提示词ID: ${idsToRemove.join(', ')}`);
    
    // 确认要删除
    console.log('这是一个危险操作，将会从数据库中永久删除这些提示词');
    console.log('如果要继续，请运行 cleanPrompts(true)');
  } catch (error) {
    console.error('清理提示词时出错:', error);
  }
}

// 实际执行删除操作
async function doDeletePrompts() {
  try {
    console.log(`正在删除提示词ID: ${promptIdsToRemove.join(', ')}...`);
    
    // 删除提示词
    const { error: deleteError } = await supabase
      .from('prompts')
      .delete()
      .in('id', promptIdsToRemove);
    
    if (deleteError) {
      console.error('删除提示词出错:', deleteError);
      return;
    }
    
    console.log('提示词删除成功');
    
    // 再次查询确认
    const { data: remainingPrompts } = await supabase
      .from('prompts')
      .select('id, title')
      .order('id');
    
    console.log('删除后剩余的提示词:');
    remainingPrompts.forEach(prompt => {
      console.log(`- ID: ${prompt.id}, 标题: ${prompt.title}`);
    });
  } catch (error) {
    console.error('删除提示词时出错:', error);
  }
}

// 执行清理检查
cleanPrompts();

// 如果确认要删除，请调用以下函数
// doDeletePrompts(); 