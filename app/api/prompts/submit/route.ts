import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 获取用户 ID 从请求头中
const getUserIdFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  // 从 token 中提取用户 ID
  // 模拟 token 格式: mock_jwt_token_{userId}
  const match = token.match(/mock_jwt_token_(\d+)/);
  return match ? match[1] : null;
};

// 根据ID获取用户信息
const getUserById = (userId: number): any | null => {
  try {
    const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
    if (!fs.existsSync(usersFilePath)) {
      return null;
    }
    
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(usersData);
    
    return users.find((user: any) => user.id === userId) || null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

// 获取提示词数据
const getPromptsData = (): any[] => {
  try {
    const promptsFilePath = path.join(process.cwd(), 'data', 'prompts.json');
    if (!fs.existsSync(promptsFilePath)) {
      return [];
    }
    const data = fs.readFileSync(promptsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取提示词数据失败:', error);
    return [];
  }
};

// 保存提示词数据
const savePromptsData = (prompts: any[]): boolean => {
  try {
    const promptsFilePath = path.join(process.cwd(), 'data', 'prompts.json');
    const dirPath = path.dirname(promptsFilePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(promptsFilePath, JSON.stringify(prompts, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('保存提示词数据失败:', error);
    return false;
  }
};

// POST 请求处理提交提示词
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, content, description, category, model } = data;

    // 验证必填字段
    if (!title || !content || !description || !category || !model) {
      return NextResponse.json(
        { success: false, error: '所有字段都是必填的' },
        { status: 400 }
      );
    }

    // 获取认证头
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromHeader(authHeader);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权，请先登录' },
        { status: 401 }
      );
    }

    // 获取用户信息
    const user = getUserById(parseInt(userId));
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取现有提示词
    const prompts = getPromptsData();
    
    // 创建新提示词
    const newPrompt = {
      id: prompts.length > 0 ? Math.max(...prompts.map((p: any) => p.id)) + 1 : 1,
      title,
      content,
      description,
      category,
      model,
      author: {
        id: user.id,
        name: user.name || user.username,
        avatar: user.avatar || '/avatars/default.png'
      },
      status: '待审核',
      date: new Date().toISOString(),
      likes: 0
    };

    // 添加到提示词列表并保存
    prompts.push(newPrompt);
    if (!savePromptsData(prompts)) {
      return NextResponse.json(
        { success: false, error: '提交提示词失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '提示词已提交，等待审核',
      prompt: newPrompt
    });
  } catch (error) {
    console.error('提交提示词时出错:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 