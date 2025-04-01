import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '@/lib/jwt';

// 定义提示词类型
interface Prompt {
  id: number;
  userId: string;
  username: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 加载提示词数据
function loadPromptsData(): Prompt[] {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'prompts.json');
    if (!fs.existsSync(dataPath)) {
      return [];
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('加载提示词数据失败:', error);
    return [];
  }
}

// 保存提示词数据
function savePromptsData(prompts: Prompt[]): boolean {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'prompts.json');
    const dataDir = path.dirname(dataPath);
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(dataPath, JSON.stringify(prompts, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('保存提示词数据失败:', error);
    return false;
  }
}

// 加载分类数据
function loadCategoriesData(): any[] {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'categories.json');
    if (!fs.existsSync(dataPath)) {
      return [];
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('加载分类数据失败:', error);
    return [];
  }
}

// 生成下一个ID
function getNextId(prompts: Prompt[]): number {
  if (prompts.length === 0) {
    return 1;
  }
  return Math.max(...prompts.map(p => p.id)) + 1;
}

// 验证提示词数据
function validatePrompt(prompt: any, categories: any[]): { isValid: boolean; error?: string } {
  if (!prompt.title || prompt.title.trim() === '') {
    return { isValid: false, error: '提示词标题不能为空' };
  }
  
  if (!prompt.content || prompt.content.trim() === '') {
    return { isValid: false, error: '提示词内容不能为空' };
  }
  
  if (!prompt.category || prompt.category.trim() === '') {
    return { isValid: false, error: '提示词分类不能为空' };
  }
  
  // 验证分类是否存在
  const categoryExists = categories.some(c => c.slug === prompt.category);
  if (!categoryExists) {
    return { isValid: false, error: `分类 '${prompt.category}' 不存在` };
  }
  
  // 验证标签
  if (!Array.isArray(prompt.tags)) {
    return { isValid: false, error: '标签必须是数组' };
  }
  
  return { isValid: true };
}

// 批量上传提示词
export async function POST(request: NextRequest) {
  try {
    // 获取授权头
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
    }
    
    // 验证用户身份
    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    
    if (!payload || !payload.user) {
      return NextResponse.json({ success: false, error: '无效的令牌' }, { status: 401 });
    }
    
    // 解析请求体
    const body = await request.json();
    console.log('上传提示词请求:', body);
    const { prompts: newPrompts } = body;
    
    if (!Array.isArray(newPrompts) || newPrompts.length === 0) {
      return NextResponse.json({ success: false, error: '提示词数据格式不正确' }, { status: 400 });
    }
    
    // 加载现有提示词和分类数据
    const existingPrompts = loadPromptsData();
    const categories = loadCategoriesData();
    
    // 处理新提示词
    let nextId = getNextId(existingPrompts);
    const validPrompts: Prompt[] = [];
    const invalidPrompts: { data: any; error: string }[] = [];
    
    for (const promptData of newPrompts) {
      // 验证提示词数据
      // 如果没有提供分类，使用第一个可用分类
      if (!promptData.category || promptData.category.trim() === '') {
        if (categories.length > 0) {
          promptData.category = categories[0].slug;
        } else {
          invalidPrompts.push({ data: promptData, error: '未提供分类且系统中没有可用分类' });
          continue;
        }
      }
      
      // 如果没有提供标签，使用空数组
      if (!Array.isArray(promptData.tags)) {
        promptData.tags = [];
      }
      
      // 验证基本要求
      if (!promptData.title || promptData.title.trim() === '') {
        invalidPrompts.push({ data: promptData, error: '提示词标题不能为空' });
        continue;
      }
      
      if (!promptData.content || promptData.content.trim() === '') {
        invalidPrompts.push({ data: promptData, error: '提示词内容不能为空' });
        continue;
      }
      
      // 创建新提示词对象
      const newPrompt: Prompt = {
        id: nextId++,
        userId: payload.user.id,
        username: payload.user.username,
        title: promptData.title.trim(),
        content: promptData.content.trim(),
        category: promptData.category.trim(),
        tags: promptData.tags.map((tag: string) => tag.trim()).filter((tag: string) => tag !== ''),
        status: 'pending', // 设置为待审核状态
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      validPrompts.push(newPrompt);
    }
    
    // 如果没有有效的提示词，返回错误
    if (validPrompts.length === 0) {
      return NextResponse.json({
        success: false,
        error: '没有有效的提示词数据',
        invalidPrompts
      }, { status: 400 });
    }
    
    // 保存到数据文件
    const updatedPrompts = [...existingPrompts, ...validPrompts];
    const saved = savePromptsData(updatedPrompts);
    
    if (!saved) {
      return NextResponse.json({ success: false, error: '保存数据失败' }, { status: 500 });
    }
    
    console.log(`成功添加了 ${validPrompts.length} 个提示词到待审核列表`);
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: `成功上传 ${validPrompts.length} 条提示词，${invalidPrompts.length} 条无效`,
      validCount: validPrompts.length,
      invalidCount: invalidPrompts.length,
      invalidPrompts: invalidPrompts.length > 0 ? invalidPrompts : undefined
    });
  } catch (error) {
    console.error('批量上传提示词失败:', error);
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 });
  }
} 