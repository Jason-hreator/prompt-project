// 前端数据修复脚本
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase连接配置
const supabaseUrl = 'https://tzsmhrvusihuoqbifmpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c21ocnZ1c2lodW9xYmlmbXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDQxMDAsImV4cCI6MjA1Nzk4MDEwMH0.K6emfisOYmQfbChpheYAFQjYS01o-UY0nMYacN_H8nM';

const supabase = createClient(supabaseUrl, supabaseKey);

// 检查并修复前端代码中硬编码的提示词
async function fixFrontendData() {
  try {
    console.log('开始修复前端数据...');
    
    // 获取数据库中实际存在的提示词
    const { data: existingPrompts, error } = await supabase
      .from('prompts')
      .select('id, title, model, category')
      .order('id');
    
    if (error) {
      console.error('获取提示词数据出错:', error);
      return;
    }
    
    if (!existingPrompts || existingPrompts.length === 0) {
      console.error('数据库中没有提示词数据');
      return;
    }
    
    console.log('数据库中存在的提示词:');
    existingPrompts.forEach(prompt => {
      console.log(`- ID: ${prompt.id}, 标题: ${prompt.title}, 模型: ${prompt.model}, 分类: ${prompt.category}`);
    });
    
    // 实际存在的提示词ID
    const validIds = existingPrompts.map(p => p.id);
    console.log('有效的提示词ID:', validIds);
    
    // 直接修改FeaturedPrompts组件，限制只显示数据库中存在的提示词
    const featuredPromptsPath = path.join(__dirname, '..', 'app', 'components', 'FeaturedPrompts.tsx');
    
    // 读取文件内容
    let content = '';
    try {
      content = fs.readFileSync(featuredPromptsPath, 'utf8');
      console.log('成功读取FeaturedPrompts.tsx');
    } catch (readError) {
      console.error('读取FeaturedPrompts.tsx失败:', readError);
      return;
    }
    
    // 修改内容，增加过滤器确保只显示有效ID的提示词
    const updatedContent = content.replace(
      'setPrompts(data.data || data.prompts || []);',
      `const allPrompts = data.data || data.prompts || [];
          // 过滤出数据库中存在的提示词
          const validIds = ${JSON.stringify(validIds)};
          const filteredPrompts = allPrompts.filter(prompt => validIds.includes(prompt.id));
          console.log('过滤前提示词数量:', allPrompts.length, '过滤后提示词数量:', filteredPrompts.length);
          setPrompts(filteredPrompts);`
    );
    
    // 写回文件
    if (content !== updatedContent) {
      try {
        fs.writeFileSync(featuredPromptsPath, updatedContent, 'utf8');
        console.log('成功修改FeaturedPrompts.tsx，添加了有效ID过滤');
      } catch (writeError) {
        console.error('写入FeaturedPrompts.tsx失败:', writeError);
      }
    } else {
      console.log('FeaturedPrompts.tsx无需修改');
    }
    
    // 检查并修复首页硬编码的提示词数据
    const homePath = path.join(__dirname, '..', 'app', 'page.tsx');
    let homeContent = '';
    try {
      homeContent = fs.readFileSync(homePath, 'utf8');
      console.log('成功读取page.tsx');
    } catch (readError) {
      console.error('读取page.tsx失败:', readError);
    }
    
    // 检查是否有硬编码的提示词展示组件
    if (homeContent.includes('<div className="grid grid-cols-1 md:grid-cols-3 gap-6">') &&
        homeContent.includes('featuredPrompts.map((prompt)')) {
      console.log('首页存在硬编码展示提示词的组件，建议替换为FeaturedPrompts组件');
    }
    
    console.log('前端数据修复完成!');
  } catch (error) {
    console.error('修复前端数据出错:', error);
  }
}

// 运行修复脚本
fixFrontendData(); 