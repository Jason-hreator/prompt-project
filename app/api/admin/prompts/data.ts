// 导出提示词数据，以便其他API可以共享
import fs from 'fs';
import path from 'path';

// 默认的初始数据
const initialPromptsData = [
  {
    id: 1,
    title: '专业邮件撰写助手',
    author: '张三',
    category: '效率提升型',
    model: 'ChatGPT',
    status: '已发布',
    date: '2023-03-15',
    likes: 458,
    comments: 32,
  },
  {
    id: 2,
    title: '科幻风格人物肖像',
    author: '李四',
    category: '创意生成型',
    model: 'Midjourney',
    status: '已发布',
    date: '2023-03-14',
    likes: 352,
    comments: 28,
  },
  {
    id: 3,
    title: '代码重构与优化',
    author: '王五',
    category: '解决问题型',
    model: 'ChatGPT',
    status: '已发布',
    date: '2023-03-13',
    likes: 289,
    comments: 41,
  },
  {
    id: 4,
    title: '学习计划生成器',
    author: '赵六',
    category: '知识学习型',
    model: 'Claude',
    status: '待审核',
    date: '2023-03-12',
    likes: 0,
    comments: 0,
  },
  {
    id: 5,
    title: '投资风险分析',
    author: '钱七',
    category: '决策辅助型',
    model: 'ChatGPT',
    status: '待审核',
    date: '2023-03-11',
    likes: 0,
    comments: 0,
  },
  {
    id: 6,
    title: '抽象艺术生成器',
    author: '孙八',
    category: '创意生成型',
    model: 'DALL-E',
    status: '已拒绝',
    date: '2023-03-10',
    likes: 0,
    comments: 0,
  },
  {
    id: 7,
    title: '营销文案助手',
    author: '周九',
    category: '效率提升型',
    model: 'ChatGPT',
    status: '草稿',
    date: '2023-03-09',
    likes: 0,
    comments: 0,
  },
  {
    id: 8,
    title: '产品说明书优化器',
    author: '吴十',
    category: '效率提升型',
    model: 'Claude',
    status: '已发布',
    date: '2023-03-08',
    likes: 187,
    comments: 23,
  },
  {
    id: 9,
    title: '故事创作灵感生成器',
    author: '郑十一',
    category: '创意生成型',
    model: 'ChatGPT',
    status: '已发布',
    date: '2023-03-07',
    likes: 245,
    comments: 19,
  },
  {
    id: 10,
    title: '水彩风景画生成器',
    author: '王十二',
    category: '创意生成型',
    model: 'DALL-E',
    status: '已发布',
    date: '2023-03-06',
    likes: 213,
    comments: 15,
  },
  {
    id: 11,
    title: '旅行计划助手',
    author: '李十三',
    category: '效率提升型',
    model: 'ChatGPT',
    status: '待审核',
    date: '2023-03-05',
    likes: 0,
    comments: 0,
  },
  {
    id: 12,
    title: '数据可视化生成器',
    author: '张十四',
    category: '解决问题型',
    model: 'ChatGPT',
    status: '已发布',
    date: '2023-03-04',
    likes: 176,
    comments: 21,
  },
];

// 使用内存作为主要存储
let promptsData = [...initialPromptsData];

// 数据文件路径
const dataFilePath = path.join(process.cwd(), 'data', 'prompts.json');

// 尝试从文件加载数据，但不影响程序正常运行
try {
  // 确保数据目录存在
  if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    try {
      fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
      console.log('成功创建数据目录');
    } catch (dirError) {
      console.error('创建数据目录失败，将使用内存存储:', dirError);
    }
  }

  // 尝试从文件读取数据
  if (fs.existsSync(dataFilePath)) {
    try {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      const parsedData = JSON.parse(fileData);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        promptsData = parsedData;
        console.log('从文件加载了提示词数据');
      }
    } catch (readError) {
      console.error('读取数据文件失败，将使用初始数据:', readError);
    }
  } else {
    // 尝试初始化文件
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(promptsData, null, 2), 'utf8');
      console.log('已初始化提示词数据文件');
    } catch (writeError) {
      console.error('初始化数据文件失败，将使用内存存储:', writeError);
    }
  }
} catch (error) {
  console.error('数据初始化过程中出错，将使用内存存储:', error);
}

// 保存数据到文件 - 容错实现
function saveData() {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(promptsData, null, 2), 'utf8');
    console.log('提示词数据已保存到文件');
    return true;
  } catch (error) {
    console.error('保存数据文件失败，但数据仍保留在内存中:', error);
    return false;
  }
}

export { promptsData };

// 添加辅助函数来修改数据 - 即使文件操作失败，内存中的数据依然会更新
export function updatePromptsStatus(ids: number[], status: string) {
  promptsData = promptsData.map(prompt => 
    ids.includes(prompt.id) ? { ...prompt, status } : prompt
  );
  saveData(); // 即使保存失败，返回的是更新后的内存数据
  return promptsData;
}

export function deletePrompts(ids: number[]) {
  console.log(`批量删除的ID列表:`, ids);
  const originalLength = promptsData.length;
  promptsData = promptsData.filter(prompt => !ids.includes(prompt.id));
  const deletedCount = originalLength - promptsData.length;
  console.log(`成功从内存中删除了${deletedCount}个提示词`);
  
  const saveResult = saveData();
  if (!saveResult) {
    console.warn('文件保存失败，但内存数据已更新');
  }
  
  return promptsData;
}

export function deletePrompt(id: number) {
  console.log(`删除单个提示词，ID: ${id}`);
  const originalLength = promptsData.length;
  promptsData = promptsData.filter(prompt => prompt.id !== id);
  
  if (originalLength === promptsData.length) {
    console.warn(`未找到ID为${id}的提示词`);
    return null;
  }
  
  console.log(`成功从内存中删除ID为${id}的提示词`);
  const saveResult = saveData();
  if (!saveResult) {
    console.warn('文件保存失败，但内存数据已更新');
  }
  
  return promptsData;
}

export function updatePrompt(id: number, data: any) {
  promptsData = promptsData.map(prompt => 
    prompt.id === id ? { ...prompt, ...data } : prompt
  );
  saveData();
  return promptsData.find(p => p.id === id);
} 