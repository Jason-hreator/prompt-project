import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { getUserIdFromHeader, isAdmin } from '@/lib/auth';

// GET: 获取本地化数据
export async function GET(request: Request) {
  try {
    // 获取认证头并验证管理员权限
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromHeader(authHeader);

    // 检查权限
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { success: false, error: '权限不足，需要管理员权限' },
        { status: 403 }
      );
    }
    
    // 获取请求参数
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language'); // 例如 zh-CN, en-US 等
    
    if (language) {
      // 如果请求特定语言的数据
      const { data: languageData, error: languageError } = await supabase
        .from('languages')
        .select('*')
        .eq('code', language)
        .single();
      
      if (languageError || !languageData) {
        return NextResponse.json({ 
          success: false, 
          error: '未找到指定语言' 
        }, { status: 404 });
      }
      
      // 获取该语言的翻译进度
      const { data: translationData, error: translationError } = await supabase
        .from('translations')
        .select('*')
        .eq('language_code', language);
      
      if (translationError) {
        console.error('获取翻译数据失败:', translationError);
      }
      
      // 计算翻译进度
      const translationProgress: Record<string, number> = {};
      
      if (translationData) {
        // 假设translations表有字段：module, language_code, percentage
        translationData.forEach(translation => {
          translationProgress[translation.module] = translation.percentage || 0;
        });
      }
      
      // 获取该语言的日期时间格式
      const { data: formatData, error: formatError } = await supabase
        .from('date_formats')
        .select('*')
        .eq('language_code', language)
        .single();
      
      if (formatError) {
        console.error('获取日期格式数据失败:', formatError);
      }
      
      const dateTimeFormat = formatData || { 
        date: 'YYYY-MM-DD', 
        time: 'HH:mm:ss',
        datetime: 'YYYY-MM-DD HH:mm:ss'
      };
      
      return NextResponse.json({ 
        success: true,
        data: {
          language: languageData,
          translationProgress,
          dateTimeFormat
        }
      }, { status: 200 });
    } else {
      // 返回所有本地化数据
      // 获取所有支持的语言
      const { data: languages, error: languagesError } = await supabase
        .from('languages')
        .select('*');
      
      if (languagesError) {
        console.error('获取语言数据失败:', languagesError);
      }
      
      // 获取所有翻译进度数据
      const { data: allTranslations, error: allTranslationsError } = await supabase
        .from('translations')
        .select('*');
      
      if (allTranslationsError) {
        console.error('获取翻译数据失败:', allTranslationsError);
      }
      
      // 获取所有日期格式数据
      const { data: allFormats, error: allFormatsError } = await supabase
        .from('date_formats')
        .select('*');
      
      if (allFormatsError) {
        console.error('获取日期格式数据失败:', allFormatsError);
      }
      
      // 组织数据结构
      const translationProgress = {};
      if (allTranslations) {
        allTranslations.forEach(translation => {
          if (!translationProgress[translation.module]) {
            translationProgress[translation.module] = {};
          }
          translationProgress[translation.module][translation.language_code] = translation.percentage || 0;
        });
      }
      
      const dateTimeFormats = {};
      if (allFormats) {
        allFormats.forEach(format => {
          dateTimeFormats[format.language_code] = {
            date: format.date,
            time: format.time,
            datetime: format.datetime
          };
        });
      }
      
      return NextResponse.json({ 
        success: true,
        data: {
          supportedLanguages: languages || [],
          translationProgress,
          dateTimeFormats
        }
      }, { status: 200 });
    }
  } catch (error) {
    console.error('获取本地化数据失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '获取本地化数据失败: ' + (error instanceof Error ? error.message : String(error)) 
    }, { status: 500 });
  }
}

// POST: 更新语言状态或添加新语言
export async function POST(request: Request) {
  try {
    // 获取认证头并验证管理员权限
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromHeader(authHeader);

    // 检查权限
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { success: false, error: '权限不足，需要管理员权限' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // 验证必需字段
    if (!body.code || !body.name || !body.nativeName) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要字段' 
      }, { status: 400 });
    }
    
    // 检查语言是否已存在
    const { data: existingLanguage, error: checkError } = await supabase
      .from('languages')
      .select('id')
      .eq('code', body.code)
      .maybeSingle();
    
    if (checkError) {
      console.error('检查语言是否存在失败:', checkError);
      return NextResponse.json({ 
        success: false, 
        error: '检查语言是否存在失败: ' + checkError.message 
      }, { status: 500 });
    }
    
    let result;
    let message;
    
    if (existingLanguage) {
      // 更新现有语言
      const { data, error } = await supabase
        .from('languages')
        .update({
          name: body.name,
          native_name: body.nativeName,
          enabled: body.enabled !== undefined ? body.enabled : true,
          completion_percentage: body.completionPercentage || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLanguage.id)
        .select()
        .single();
      
      if (error) {
        console.error('更新语言失败:', error);
        return NextResponse.json({ 
          success: false, 
          error: '更新语言失败: ' + error.message 
        }, { status: 500 });
      }
      
      result = data;
      message = '语言信息已更新';
    } else {
      // 添加新语言
      const { data, error } = await supabase
        .from('languages')
        .insert({
          code: body.code,
          name: body.name,
          native_name: body.nativeName,
          enabled: body.enabled !== undefined ? body.enabled : true,
          completion_percentage: body.completionPercentage || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('添加新语言失败:', error);
        return NextResponse.json({ 
          success: false, 
          error: '添加新语言失败: ' + error.message 
        }, { status: 500 });
      }
      
      result = data;
      message = '新语言已添加';
    }
    
    // 格式化返回数据
    const updatedLanguage = {
      code: result.code,
      name: result.name,
      nativeName: result.native_name,
      enabled: result.enabled,
      completionPercentage: result.completion_percentage
    };
    
    return NextResponse.json({ 
      success: true,
      data: updatedLanguage,
      message: message
    }, { status: 200 });
  } catch (error) {
    console.error('更新语言信息失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '更新语言信息失败: ' + (error instanceof Error ? error.message : String(error)) 
    }, { status: 500 });
  }
} 