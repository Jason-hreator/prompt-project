import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { getUserIdFromHeader, isAdmin } from '@/lib/auth';

// 分类数据类型
interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  prompt_count?: number;
  created_at?: string;
  updated_at?: string;
}

// 获取分类数据
const getCategoriesData = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) {
      console.error('读取分类数据失败:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('读取分类数据失败:', error);
    return [];
  }
};

// 保存分类数据
const saveCategory = async (category: Category): Promise<Category | null> => {
  try {
    if (category.id) {
      // 更新现有分类
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          slug: category.slug,
          description: category.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id)
        .select()
        .single();
      
      if (error) {
        console.error('更新分类失败:', error);
        return null;
      }
      
      return data;
    } else {
      // 创建新分类
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          slug: category.slug,
          description: category.description,
          prompt_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('创建分类失败:', error);
        return null;
      }
      
      return data;
    }
  } catch (error) {
    console.error('保存分类数据失败:', error);
    return null;
  }
};

// 删除分类
const deleteCategory = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('删除分类失败:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('删除分类失败:', error);
    return false;
  }
};

// GET: 获取分类列表
export async function GET(request: Request) {
  try {
    // 获取认证头
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromHeader(authHeader);

    // 检查权限
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { success: false, error: '权限不足，需要管理员权限' },
        { status: 403 }
      );
    }

    const categories = await getCategoriesData();
    
    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取分类列表失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// POST: 创建新分类
export async function POST(request: Request) {
  try {
    // 获取认证头
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromHeader(authHeader);

    // 检查权限
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { success: false, error: '权限不足，需要管理员权限' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { name, slug, description } = data;

    // 验证必填字段
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: '名称和 slug 为必填字段' },
        { status: 400 }
      );
    }

    // 检查 slug 是否已存在
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    
    if (checkError) {
      console.error('检查分类slug失败:', checkError);
      return NextResponse.json(
        { success: false, error: '检查分类slug失败' },
        { status: 500 }
      );
    }
    
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: '该 Slug 已存在' },
        { status: 400 }
      );
    }

    // 创建新分类
    const newCategory: Category = {
      id: 0, // 将由Supabase生成
      name,
      slug,
      description: description || '',
    };

    // 保存数据
    const savedCategory = await saveCategory(newCategory);
    
    if (!savedCategory) {
      return NextResponse.json(
        { success: false, error: '保存分类失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: savedCategory
    });
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json(
      { success: false, error: '创建分类失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// PUT: 更新分类
export async function PUT(request: Request) {
  try {
    // 获取认证头
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromHeader(authHeader);

    // 检查权限
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { success: false, error: '权限不足，需要管理员权限' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { id, name, slug, description } = data;

    // 验证必填字段
    if (!id || !name || !slug) {
      return NextResponse.json(
        { success: false, error: '缺少必要字段' },
        { status: 400 }
      );
    }

    // 检查分类是否存在
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (checkError || !existingCategory) {
      return NextResponse.json(
        { success: false, error: '分类不存在' },
        { status: 404 }
      );
    }

    // 检查 slug 是否已被其他分类使用
    const { data: slugCategory, error: slugCheckError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .maybeSingle();
    
    if (slugCheckError) {
      console.error('检查分类slug失败:', slugCheckError);
      return NextResponse.json(
        { success: false, error: '检查分类slug失败' },
        { status: 500 }
      );
    }
    
    if (slugCategory) {
      return NextResponse.json(
        { success: false, error: '该 Slug 已被其他分类使用' },
        { status: 400 }
      );
    }

    // 更新分类
    const categoryToUpdate: Category = {
      id,
      name,
      slug,
      description: description || '',
    };

    // 保存数据
    const updatedCategory = await saveCategory(categoryToUpdate);
    
    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, error: '保存分类失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('更新分类失败:', error);
    return NextResponse.json(
      { success: false, error: '更新分类失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// DELETE: 删除分类
export async function DELETE(request: Request) {
  try {
    // 获取认证头
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromHeader(authHeader);

    // 检查权限
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { success: false, error: '权限不足，需要管理员权限' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的分类 ID' },
        { status: 400 }
      );
    }

    // 检查分类是否存在
    const { data: category, error: checkError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (checkError || !category) {
      return NextResponse.json(
        { success: false, error: '分类不存在' },
        { status: 404 }
      );
    }
    
    // 检查分类下是否有提示词
    const { count, error: countError } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('category', category.name);
    
    if (countError) {
      console.error('检查分类下提示词数量失败:', countError);
      return NextResponse.json(
        { success: false, error: '检查分类下提示词数量失败' },
        { status: 500 }
      );
    }
    
    if (count && count > 0) {
      return NextResponse.json(
        { success: false, error: '该分类下仍有提示词，无法删除' },
        { status: 400 }
      );
    }
    
    // 删除分类
    const success = await deleteCategory(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: '删除分类失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '分类已成功删除'
    });
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json(
      { success: false, error: '删除分类失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 