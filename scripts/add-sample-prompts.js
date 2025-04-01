// 添加示例提示词脚本
const { createClient } = require('@supabase/supabase-js');

// Supabase连接配置
const supabaseUrl = 'https://tzsmhrvusihuoqbifmpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c21ocnZ1c2lodW9xYmlmbXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDQxMDAsImV4cCI6MjA1Nzk4MDEwMH0.K6emfisOYmQfbChpheYAFQjYS01o-UY0nMYacN_H8nM';

const supabase = createClient(supabaseUrl, supabaseKey);

// 示例提示词数据
const samplePrompts = [
  {
    title: '专业邮件撰写助手',
    content: `我希望你充当一位专业的商务邮件撰写助手。我将提供以下信息：
1. 邮件主题或目的
2. 主要要点或内容
3. 预期的语气（例如：正式、友好、紧急等）

请根据我提供的信息，帮我撰写一封完整的专业商务邮件，包括：
- 合适的问候语
- 清晰的正文（包含所有要点，并做适当的段落划分）
- 得体的结束语和签名

请确保邮件内容：
- 逻辑清晰、结构完整
- 无语法错误
- 专业且得体
- 符合商业交流的标准和惯例`,
    description: '输入主题和关键点，生成专业的商业邮件，适合各种职场场景。',
    category: '效率提升型',
    model: 'GPT-4',
    status: '已审核',
    date: new Date().toISOString(),
    likes: 458
  },
  {
    title: '代码解释器',
    content: `请解释以下代码的功能并提供改进建议：{{ 帮助理解代码的功能并提供改进建议 }}`,
    description: '帮助理解和优化代码',
    category: '编程辅助型',
    model: 'ChatGPT',
    status: '已审核',
    date: new Date(Date.now() - 86400000).toISOString(), // 1天前
    likes: 289
  }
];

// 添加示例提示词
async function addSamplePrompts() {
  try {
    console.log('开始添加示例提示词...');
    
    // 首先检查当前数据库中的提示词
    const { data: existingPrompts, error: queryError } = await supabase
      .from('prompts')
      .select('id, title')
      .order('id');
    
    if (queryError) {
      console.error('查询现有提示词出错:', queryError);
      return;
    }
    
    console.log('当前数据库中的提示词:');
    if (existingPrompts && existingPrompts.length > 0) {
      existingPrompts.forEach(prompt => {
        console.log(`- ID: ${prompt.id}, 标题: ${prompt.title}`);
      });
    } else {
      console.log('数据库中没有提示词');
    }
    
    // 检查哪些示例提示词不存在
    const existingTitles = (existingPrompts || []).map(p => p.title);
    const promptsToAdd = samplePrompts.filter(
      sample => !existingTitles.includes(sample.title)
    );
    
    if (promptsToAdd.length === 0) {
      console.log('所有示例提示词已存在，无需添加');
      return;
    }
    
    console.log(`需要添加 ${promptsToAdd.length} 个提示词:`);
    promptsToAdd.forEach(prompt => {
      console.log(`- 标题: ${prompt.title}`);
    });
    
    // 添加提示词
    for (const prompt of promptsToAdd) {
      const { data, error: insertError } = await supabase
        .from('prompts')
        .insert([prompt])
        .select();
      
      if (insertError) {
        console.error(`添加提示词 "${prompt.title}" 失败:`, insertError);
      } else {
        console.log(`成功添加提示词: ${prompt.title}, ID: ${data[0].id}`);
      }
    }
    
    // 再次查询确认
    const { data: updatedPrompts } = await supabase
      .from('prompts')
      .select('id, title')
      .order('id');
    
    console.log('添加后的提示词:');
    updatedPrompts.forEach(prompt => {
      console.log(`- ID: ${prompt.id}, 标题: ${prompt.title}`);
    });
    
    console.log('示例提示词添加完成!');
  } catch (error) {
    console.error('添加示例提示词时出错:', error);
  }
}

// 执行添加示例提示词
addSamplePrompts(); 