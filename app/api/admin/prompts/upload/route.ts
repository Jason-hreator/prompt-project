import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 获取提示词数据
function getPromptsData() {
  try {
    const promptsFilePath = path.join(process.cwd(), 'data', 'prompts.json');
    if (!fs.existsSync(promptsFilePath)) {
      console.log('提示词数据文件不存在');
      return [];
    }
    const data = fs.readFileSync(promptsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取提示词数据失败:', error);
    return [];
  }
}

// 保存提示词数据
function savePromptsData(prompts) {
  try {
    const promptsFilePath = path.join(process.cwd(), 'data', 'prompts.json');
    const dataDir = path.dirname(promptsFilePath);
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(promptsFilePath, JSON.stringify(prompts, null, 2), 'utf8');
    console.log('提示词数据已保存到文件');
    return true;
  } catch (error) {
    console.error('保存提示词数据失败:', error);
    return false;
  }
}

// 获取数组中最大ID
const getMaxId = (promptsData) => {
  if (!promptsData || promptsData.length === 0) return 0;
  return Math.max(...promptsData.map(prompt => Number(prompt.id) || 0), 0);
};

// POST: 上传提示词 (单个或批量)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('上传提示词请求:', body);
    
    // 验证请求格式
    if (!body.prompts || !Array.isArray(body.prompts)) {
      console.error('请求格式错误:', body);
      return NextResponse.json({
        success: false,
        error: '请求格式错误: 缺少prompts数组'
      }, { status: 400 });
    }
    
    // 从文件获取现有提示词
    const promptsData = getPromptsData();
    console.log(`从文件加载了提示词数据，共 ${promptsData.length} 条`);
    
    // 验证并处理每个提示词
    const { prompts } = body;
    const validPrompts = [];
    const errors = [];
    
    // 获取当前最大ID
    const maxId = getMaxId(promptsData);
    console.log(`当前最大ID: ${maxId}`);
    
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      
      // 验证必填字段
      if (!prompt.content && !prompt.promptText) {
        errors.push(`提示词#${i+1}: 缺少必填字段 "content"`);
        continue;
      }
      
      // 准备要保存的提示词数据
      const newPrompt = {
        id: maxId + 1 + validPrompts.length,
        title: prompt.title || '未命名提示词',
        content: prompt.content || prompt.promptText,
        author: prompt.author || 'admin', // 默认作者
        category: prompt.category || '未分类',
        model: prompt.model || 'ChatGPT',
        status: '待审核', // 所有上传的提示词初始状态为待审核
        createdAt: new Date().toISOString(), // 当前日期时间
        updatedAt: new Date().toISOString(),
        likes: 0,
        comments: [],
        description: prompt.description || '',
        instructions: prompt.instructions || ''
      };
      
      validPrompts.push(newPrompt);
    }
    
    // 如果所有提示词都无效，则返回错误
    if (validPrompts.length === 0) {
      console.error('没有有效的提示词数据:', errors);
      return NextResponse.json({
        success: false,
        error: '没有提供有效的提示词数据',
        details: errors
      }, { status: 400 });
    }
    
    // 将有效的提示词添加到数据库
    promptsData.push(...validPrompts);
    
    // 保存到文件
    if (!savePromptsData(promptsData)) {
      return NextResponse.json({
        success: false,
        error: '保存提示词数据到文件失败'
      }, { status: 500 });
    }
    
    console.log(`成功添加了 ${validPrompts.length} 个提示词到待审核列表`);
    
    // 返回成功响应，包含成功和失败的数量
    return NextResponse.json({
      success: true,
      message: `成功上传 ${validPrompts.length} 个提示词，已添加到待审核列表`,
      data: {
        uploadedCount: validPrompts.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined
      }
    }, { status: 200 });
  } catch (error) {
    console.error('上传提示词失败:', error);
    return NextResponse.json({
      success: false,
      error: '上传提示词失败: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 