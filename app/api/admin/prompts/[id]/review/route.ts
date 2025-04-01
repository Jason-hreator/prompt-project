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

// 检查用户是否为管理员
const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
    if (!fs.existsSync(usersFilePath)) {
      return false;
    }
    
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(usersData);
    
    const user = users.find((u: any) => u.id.toString() === userId.toString());
    return user && user.role === 'admin';
  } catch (error) {
    console.error('检查管理员权限失败:', error);
    return false;
  }
};

// 检查用户是否有审核提示词的权限
const hasReviewPermission = (userId: string): boolean => {
  try {
    const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
    if (!fs.existsSync(usersFilePath)) {
      return false;
    }
    
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(usersData);
    
    const user = users.find((u: any) => u.id.toString() === userId.toString());
    if (!user) return false;
    
    // 如果是管理员，默认有审核权限
    if (user.role === 'admin') return true;
    
    // 检查特定权限
    return user.permissions?.prompts?.review === true;
  } catch (error) {
    console.error('检查审核权限失败:', error);
    return false;
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

// PUT 请求处理审核提示词
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 获取提示词 ID
    const promptId = parseInt(params.id);
    if (isNaN(promptId)) {
      return NextResponse.json(
        { success: false, error: '无效的提示词 ID' },
        { status: 400 }
      );
    }

    // 获取请求数据
    const data = await request.json();
    const { status } = data;

    if (!status || !['已通过', '已拒绝'].includes(status)) {
      return NextResponse.json(
        { success: false, error: '无效的状态值，必须是"已通过"或"已拒绝"' },
        { status: 400 }
      );
    }

    // 获取认证头
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromHeader(authHeader);

    // 检查权限
    if (!userId || !hasReviewPermission(userId)) {
      return NextResponse.json(
        { success: false, error: '权限不足，需要审核权限' },
        { status: 403 }
      );
    }

    // 获取提示词数据
    const prompts = getPromptsData();
    const promptIndex = prompts.findIndex(p => p.id === promptId);

    if (promptIndex === -1) {
      return NextResponse.json(
        { success: false, error: '提示词不存在' },
        { status: 404 }
      );
    }

    // 更新提示词状态
    prompts[promptIndex].status = status;
    prompts[promptIndex].reviewedBy = userId;
    prompts[promptIndex].reviewedAt = new Date().toISOString();

    // 保存到文件
    if (!savePromptsData(prompts)) {
      return NextResponse.json(
        { success: false, error: '审核提示词失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `提示词已${status === '已通过' ? '通过审核' : '被拒绝'}`,
      prompt: prompts[promptIndex]
    });
  } catch (error) {
    console.error('审核提示词时出错:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 