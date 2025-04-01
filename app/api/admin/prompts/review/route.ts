import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
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
function savePromptsData(prompts: Prompt[]) {
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

// 获取待审核的提示词
export async function GET(request: NextRequest) {
  try {
    // 获取授权头
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
    }
    
    // 验证管理员权限
    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    
    if (!payload || !payload.user || payload.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: '权限不足，需要管理员权限' }, { status: 403 });
    }
    
    // 加载提示词数据
    const prompts = loadPromptsData();
    
    // 获取URL参数
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    
    // 根据状态过滤提示词
    let filteredPrompts: Prompt[] = [];
    
    if (status === 'all') {
      filteredPrompts = prompts;
    } else {
      filteredPrompts = prompts.filter(prompt => prompt.status === status);
    }
    
    // 对结果进行分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPrompts = filteredPrompts.slice(startIndex, endIndex);
    
    // 返回响应
    return NextResponse.json({
      success: true,
      prompts: paginatedPrompts,
      pagination: {
        total: filteredPrompts.length,
        page,
        limit,
        pages: Math.ceil(filteredPrompts.length / limit)
      }
    });
  } catch (error) {
    console.error('获取待审核提示词失败:', error);
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 });
  }
}

// 更新提示词状态
export async function PUT(request: NextRequest) {
  try {
    // 获取授权头
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
    }
    
    // 验证管理员权限
    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    
    if (!payload || !payload.user || payload.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: '权限不足，需要管理员权限' }, { status: 403 });
    }
    
    // 解析请求体
    const body = await request.json();
    const { promptId, status, reason } = body;
    
    if (!promptId || !status) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }
    
    // 加载提示词数据
    const prompts = loadPromptsData();
    
    // 查找指定ID的提示词
    const promptIndex = prompts.findIndex(p => p.id === promptId);
    if (promptIndex === -1) {
      return NextResponse.json({ success: false, error: '未找到指定提示词' }, { status: 404 });
    }
    
    // 更新提示词状态
    prompts[promptIndex].status = status;
    prompts[promptIndex].updatedAt = new Date().toISOString();
    
    // 如果有拒绝原因，添加到提示词数据中
    if (status === 'rejected' && reason) {
      prompts[promptIndex].rejectionReason = reason;
    }
    
    // 保存更新后的数据
    const saved = savePromptsData(prompts);
    if (!saved) {
      return NextResponse.json({ success: false, error: '保存数据失败' }, { status: 500 });
    }
    
    // 返回响应
    return NextResponse.json({
      success: true,
      message: '提示词状态更新成功',
      prompt: prompts[promptIndex]
    });
  } catch (error) {
    console.error('更新提示词状态失败:', error);
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 });
  }
} 