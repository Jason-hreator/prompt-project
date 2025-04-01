import { NextResponse } from 'next/server';
import { getPrompts, getFeaturedPrompts } from '../../../lib/api';

// 备用示例数据
const FALLBACK_PROMPTS = [
  {
    id: 1,
    title: "专业学习助手",
    description: "为学生创建个性化学习计划和笔记总结",
    content: "你将作为我的学习助手，帮助我理解和掌握[学科名称]的知识。",
    model: "GPT-4",
    user: { id: 1, name: "教育专家", avatar: "/avatars/teacher.png" },
    category: { name: "学习辅助型" },
    created_at: "2023-04-15T08:30:00Z",
    views: 1250,
    likes: 342,
    is_featured: true
  },
  {
    id: 2,
    title: "创意写作指导",
    description: "帮助创作者突破写作瓶颈，获取新灵感",
    content: "你是一位经验丰富的创意写作教练。我正在进行一个写作项目，需要你的指导。",
    model: "Claude",
    user: { id: 2, name: "文学爱好者", avatar: "/avatars/writer.png" },
    category: { name: "创意生成型" },
    created_at: "2023-05-22T14:45:00Z",
    views: 980,
    likes: 215,
    is_featured: true
  }
];

// GET: 获取提示词列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取查询参数
    const category = searchParams.get('category');
    const model = searchParams.get('model');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const featured = searchParams.get('featured') === 'true';
    
    try {
      // 如果是请求精选提示词，使用专用API
      let prompts;
      if (featured) {
        prompts = await getFeaturedPrompts();
        console.log('获取精选提示词:', prompts.length);
      } else {
        prompts = await getPrompts();
        console.log('获取所有提示词:', prompts.length);
      }
      
      // 根据筛选条件过滤数据
      let filteredPrompts = [...prompts];
      
      // 按分类筛选
      if (category && category !== 'all') {
        filteredPrompts = filteredPrompts.filter(p => 
          p.category && p.category.name === category
        );
      }
      
      // 按模型筛选
      if (model && model !== 'all') {
        filteredPrompts = filteredPrompts.filter(p => p.model === model);
      }
      
      // 排序
      if (sort === 'newest') {
        filteredPrompts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (sort === 'popular') {
        filteredPrompts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      }
      
      // 分页
      const totalCount = filteredPrompts.length;
      const totalPages = Math.ceil(totalCount / limit) || 1;
      
      const startIdx = (page - 1) * limit;
      const endIdx = startIdx + limit;
      const paginatedPrompts = filteredPrompts.slice(startIdx, endIdx);
      
      return NextResponse.json({
        success: true,
        data: paginatedPrompts,
        totalCount,
        totalPages,
        currentPage: page
      });
      
    } catch (apiError) {
      console.error('API获取提示词失败，使用备用数据:', apiError);
      
      // 使用备用数据并应用筛选
      let fallbackData = [...FALLBACK_PROMPTS];
      
      // 应用相同的筛选逻辑
      if (featured) {
        fallbackData = fallbackData.filter(p => p.is_featured);
      }
      
      if (sort === 'popular') {
        fallbackData.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      }
      
      return NextResponse.json({
        success: true,
        data: fallbackData,
        totalCount: fallbackData.length,
        totalPages: Math.ceil(fallbackData.length / limit) || 1,
        currentPage: 1,
        source: 'fallback'
      });
    }
    
  } catch (error) {
    console.error('获取提示词列表时出错:', error);
    
    // 即使发生错误也返回某些数据，避免前端崩溃
    return NextResponse.json({
      success: true,
      data: FALLBACK_PROMPTS,
      totalCount: FALLBACK_PROMPTS.length,
      totalPages: 1,
      currentPage: 1,
      source: 'error-fallback'
    });
  }
}