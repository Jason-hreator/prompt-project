import { NextResponse } from 'next/server';
import { getPromptById, updatePrompt, deletePrompt } from '../../../../lib/api';

// 备用示例数据，与前面保持一致
const FALLBACK_PROMPTS = [
  {
    id: 1,
    title: "专业学习助手",
    description: "为学生创建个性化学习计划和笔记总结",
    content: "你将作为我的学习助手，帮助我理解和掌握[学科名称]的知识。请按照以下方式回答我的问题：\n\n1. 首先简明扼要地给出答案\n2. 然后详细解释概念和原理\n3. 提供具体的例子或应用场景\n4. 如果有不同的观点或理论，请一并说明\n5. 最后，给出3-5个相关的延伸问题，帮助我加深理解",
    model: "GPT-4",
    user: { id: 1, name: "教育专家", avatar: "/avatars/teacher.png" },
    category: { name: "学习辅助型" },
    created_at: "2023-04-15T08:30:00Z",
    views: 1250,
    likes: 342
  },
  {
    id: 2,
    title: "创意写作指导",
    description: "帮助创作者突破写作瓶颈，获取新灵感",
    content: "你是一位经验丰富的创意写作教练。我正在进行一个写作项目，需要你的指导。请帮我：\n\n1. 分析我提供的写作样本或创意\n2. 给出具体的改进建议\n3. 提供新的创意方向和灵感\n4. 如果我遇到瓶颈，提供突破性的问题或练习\n5. 根据我的风格和目标，推荐可以学习的作家或作品",
    model: "Claude",
    user: { id: 2, name: "文学爱好者", avatar: "/avatars/writer.png" },
    category: { name: "创意生成型" },
    created_at: "2023-05-22T14:45:00Z",
    views: 980,
    likes: 215
  },
  {
    id: 3,
    title: "代码审查专家",
    description: "代码优化和最佳实践建议",
    content: "作为一位资深的软件工程师，请帮我审查以下代码。请关注：\n\n1. 代码质量和可读性\n2. 潜在的性能问题\n3. 安全隐患\n4. 是否遵循最佳实践\n5. 架构和设计改进建议\n\n提供具体的改进代码示例，并解释你的建议理由。如果有多种优化方案，请说明各自的优缺点。",
    model: "GPT-4",
    user: { id: 3, name: "程序员小王", avatar: "/avatars/developer.png" },
    category: { name: "编程开发型" },
    created_at: "2023-06-10T09:15:00Z",
    views: 1560,
    likes: 478
  }
];

// GET: 获取单个提示词
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: '提示词ID不能为空' 
      }, { status: 400 });
    }
    
    try {
      // 尝试从API获取数据
      const prompt = await getPromptById(id);
      
      if (!prompt) {
        // 使用备用数据
        const fallbackPrompt = FALLBACK_PROMPTS.find(p => p.id.toString() === id);
        
        if (fallbackPrompt) {
          return NextResponse.json({ 
            success: true, 
            data: fallbackPrompt,
            source: 'fallback'
          });
        }
        
        return NextResponse.json({ 
          success: false, 
          error: '找不到该提示词' 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        success: true, 
        data: prompt
      });
      
    } catch (apiError) {
      console.error(`API获取提示词失败 (ID: ${id}):`, apiError);
      
      // 使用备用数据
      const fallbackPrompt = FALLBACK_PROMPTS.find(p => p.id.toString() === id);
      
      if (fallbackPrompt) {
        return NextResponse.json({ 
          success: true, 
          data: fallbackPrompt,
          source: 'fallback'
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: '获取提示词数据失败' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('获取提示词详情时出错:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: '服务器处理请求时出错' 
    }, { status: 500 });
  }
}