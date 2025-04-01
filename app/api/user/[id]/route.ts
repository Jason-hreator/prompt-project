import { NextResponse } from 'next/server';
import { getUserById } from '../../../../lib/api';

// 备用测试数据
const TEST_USERS = {
  'admin-test-id-123': {
    id: 'admin-test-id-123',
    name: '管理员',
    email: 'admin@example.com',
    role: 'admin',
    bio: '这是一个测试管理员账号',
    created_at: '2023-01-01T00:00:00Z'
  },
  'user-test-id-456': {
    id: 'user-test-id-456',
    name: '测试用户',
    email: 'user@example.com',
    role: 'user',
    bio: '这是一个测试用户账号',
    created_at: '2023-01-02T00:00:00Z'
  }
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: '用户ID不能为空' 
      }, { status: 400 });
    }
    
    try {
      // 尝试从API获取数据
      const user = await getUserById(id);
      
      if (!user) {
        // 检查是否为测试账号
        if (TEST_USERS[id]) {
          return NextResponse.json({ 
            success: true, 
            data: TEST_USERS[id],
            source: 'test-data'
          });
        }
        
        return NextResponse.json({ 
          success: false, 
          error: '找不到该用户' 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        success: true, 
        data: user
      });
      
    } catch (apiError) {
      console.error(`API获取用户失败 (ID: ${id}):`, apiError);
      
      // 检查是否为测试账号
      if (TEST_USERS[id]) {
        return NextResponse.json({ 
          success: true, 
          data: TEST_USERS[id],
          source: 'test-data'
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: '获取用户数据失败' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('获取用户详情时出错:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: '服务器处理请求时出错' 
    }, { status: 500 });
  }
}