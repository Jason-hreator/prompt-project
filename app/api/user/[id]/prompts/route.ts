import { NextResponse } from 'next/server';
import { getPromptsByUserId } from '../../../../../lib/api';

// 备用测试数据
const TEST_PROMPTS = {
  'admin-test-id-123': [
    {
      id: 101,
      title: "管理员的示例提示词1",
      description: "这是管理员分享的一个示例提示词",
      model: "GPT-4",
      category: { name: "创意生成型" },
      created_at: "2023-03-15T10:30:00Z",
      views: 320,
      likes: 85
    },
    {
      id: 102,
      title: "管理员的示例提示词2",
      description: "另一个管理员分享的示例提示词",
      model: "Claude",
      category: { name: "学习辅助型" },
      created_at: "2023-04-20T14:15:00Z",
      views: 210,
      likes: 65
    }
  ],
  'user-test-id-456': [
    {
      id: 201,
      title: "用户的示例提示词",
      description: "这是普通用户分享的一个示例提示词",
      model: "GPT-3.5",
      category: { name: "工作效率型" },
      created_at: "2023-05-10T09:45:00Z",
      views: 150,
      likes: 42
    }
  ]
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '用户ID不能为空' 
      }, { status: 400 });
    }
    
    try {
      // 尝试从API获取数据
      const prompts = await getPromptsByUserId(userId);
      
      if (!prompts || prompts.length === 0) {
        // 检查是否为测试账号
        if (TEST_PROMPTS[userId]) {
          return NextResponse.json({ 
            success: true, 
            data: TEST_PROMPTS[userId],
            source: 'test-data'
          });
        }
        
        // 如果没有提示词返回空数组
        return NextResponse.json({ 
          success: true, 
          data: [],
          message: '该用户暂无提示词'
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        data: prompts
      });
      
    } catch (apiError) {
      console.error(`API获取用户提示词失败 (ID: ${userId}):`, apiError);
      
      // 检查是否为测试账号
      if (TEST_PROMPTS[userId]) {
        return NextResponse.json({ 
          success: true, 
          data: TEST_PROMPTS[userId],
          source: 'test-data'
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        data: [],
        error: '获取用户提示词失败，返回空数据'
      });
    }
    
  } catch (error) {
    console.error('获取用户提示词时出错:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: '服务器处理请求时出错' 
    }, { status: 500 });
  }
}