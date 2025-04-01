// 创建种子数据脚本
const { createClient } = require('@supabase/supabase-js');

// Supabase连接配置
const supabaseUrl = 'https://tzsmhrvusihuoqbifmpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c21ocnZ1c2lodW9xYmlmbXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDQxMDAsImV4cCI6MjA1Nzk4MDEwMH0.K6emfisOYmQfbChpheYAFQjYS01o-UY0nMYacN_H8nM';

const supabase = createClient(supabaseUrl, supabaseKey);

// 示例分类数据
const categories = [
  { name: '解决问题型', icon: '🧩' },
  { name: '创意生成型', icon: '💡' },
  { name: '知识学习型', icon: '📚' },
  { name: '效率提升型', icon: '⚡' },
  { name: '决策辅助型', icon: '🧠' },
  { name: '通用模板', icon: '📝' },
];

// 示例用户数据
const users = [
  { 
    name: '测试用户', 
    email: 'test@example.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=1',
    role: 'user',
    status: 'active',
    created_at: new Date().toISOString()
  }
];

// 示例提示词数据
const prompts = [
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
- 符合商业交流的标准和惯例

请告诉我你已准备好帮助我撰写专业邮件。`,
    description: '输入主题和关键点，生成专业的商业邮件，适合各种职场场景。',
    category: '效率提升型',
    model: 'ChatGPT',
    user_id: 1, // 将与用户ID对应
    status: 'approved',
    created_at: new Date().toISOString(),
    likes: 458
  },
  {
    title: '代码重构与优化',
    content: `我希望你担任一名资深的软件工程师，帮助我重构和优化代码。我将提供代码片段，请你：

1. 分析代码结构和逻辑
2. 指出存在的问题、漏洞或性能瓶颈
3. 提供重构后的代码，使其更加高效、可读和可维护
4. 解释所做的修改及其好处

请使用以下原则进行优化：
- 遵循SOLID原则
- 优化算法和数据结构
- 减少重复代码
- 提高代码可读性
- 增强安全性
- 提升性能

我的代码使用的编程语言是：[编程语言]
以下是代码片段：
[代码片段]

请提供详细的分析和优化后的代码。`,
    description: '提供代码片段，获取优化建议和重构版本，适用于多种编程语言。',
    category: '解决问题型',
    model: 'ChatGPT',
    user_id: 1,
    status: 'approved',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1天前
    likes: 289
  },
  {
    title: '水彩风景画生成器',
    content: `我希望你担任一名专业的Midjourney提示词工程师，帮助我创建精美的水彩风景画。

请根据我提供的场景描述，生成一个详细的Midjourney提示词，包括：

1. 场景的主要元素和构图
2. 光线、颜色和情绪氛围
3. 水彩技法细节（如湿画法、干画法、泼墨等）
4. 画面风格（写实、抽象、印象派等）
5. 艺术参考（如"受霍克尼风格启发"等）

我希望最终的提示词能够生成高质量、富有艺术感的水彩风景画，并最大程度体现水彩媒介的特殊质感。

我的场景描述是：[描述场景]`,
    description: '创建逼真的水彩风景画，具有自然的色彩混合和纹理效果。',
    category: '创意生成型',
    model: 'DALL-E',
    user_id: 1,
    status: 'approved',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2天前
    likes: 213
  }
];

// 示例评论数据
const comments = [
  {
    prompt_id: 1,
    user_id: 1,
    content: '非常实用的提示词，帮我写出了很多专业邮件！',
    date: new Date().toISOString()
  },
  {
    prompt_id: 2,
    user_id: 1,
    content: '代码优化效果很好，性能提升明显。',
    date: new Date().toISOString()
  }
];

// 点赞数据
const likes = [
  {
    user_id: 1,
    prompt_id: 3
  }
];

// 使用正确的数据库表结构创建种子数据

// 需要先登录一个用户账号
async function loginUser() {
  try {
    console.log('尝试登录用户...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (error) {
      console.error('登录失败:', error);
      return false;
    } else {
      console.log('登录成功:', data.user.email);
      return true;
    }
  } catch (error) {
    console.error('登录过程出错:', error);
    return false;
  }
}

// 添加测试数据
async function addTestData() {
  try {
    console.log('开始直接查询数据...');
    
    // 首先获取已有的prompts数据
    const { data: existingPrompts, error: promptsError } = await supabase
      .from('prompts')
      .select('*')
      .order('id', { ascending: false })
      .limit(10);
    
    if (promptsError) {
      console.error('查询prompts失败:', promptsError);
    } else {
      console.log('已有的prompts数据:');
      existingPrompts.forEach(prompt => {
        console.log(`- ID: ${prompt.id}, 标题: ${prompt.title}, 分类: ${prompt.category}, 点赞: ${prompt.likes}`);
      });
    }
    
    // 查询categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('查询categories失败:', categoriesError);
    } else {
      console.log('已有的categories数据:');
      categories.forEach(category => {
        console.log(`- ID: ${category.id}, 名称: ${category.name}, 图标: ${category.icon}`);
      });
    }
    
    // 看是否有数据，如果没有足够数据，尝试修复
    if (!existingPrompts || existingPrompts.length < 3) {
      console.log('提示词数据不足，需要添加更多数据...');
      
      // 检查能否直接使用RPC函数
      const { data: rpcResult, error: rpcError } = await supabase.rpc('get_public_prompts');
      
      if (rpcError) {
        console.error('RPC调用失败:', rpcError);
      } else {
        console.log('RPC调用成功，得到公开提示词:', rpcResult);
      }
    }
    
    console.log('数据查询完成!');
  } catch (error) {
    console.error('查询数据过程中出错:', error);
  }
}

// 运行查询测试数据的函数
addTestData(); 