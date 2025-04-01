import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { getUserIdFromHeader, isAdmin } from '@/lib/auth';

// GET: 获取安全日志
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
    const level = searchParams.get('level'); // 可以是 info, warning, critical 或 null
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // 使用Supabase获取安全日志
    let query = supabase
      .from('security_logs')
      .select('*');
    
    // 根据查询参数过滤日志
    if (level) {
      query = query.eq('level', level);
    }
    
    // 如果有日期范围，可以进行过滤
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }
    
    // 执行查询
    const { data: logs, error } = await query.order('timestamp', { ascending: false });
    
    if (error) {
      console.error('查询安全日志失败:', error);
      return NextResponse.json({ 
        success: false, 
        error: '查询安全日志失败: ' + error.message 
      }, { status: 500 });
    }
    
    // 计算日志摘要
    const summary = {
      total: logs.length,
      critical: logs.filter(log => log.level === 'critical').length,
      warning: logs.filter(log => log.level === 'warning').length,
      info: logs.filter(log => log.level === 'info').length
    };
    
    return NextResponse.json({ 
      success: true,
      data: {
        logs: logs || [],
        summary
      }
    }, { status: 200 });
  } catch (error) {
    console.error('获取安全日志失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '获取安全日志失败: ' + (error instanceof Error ? error.message : String(error)) 
    }, { status: 500 });
  }
}

// POST: 创建安全日志记录
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 验证必需字段
    if (!body.type || !body.level || !body.user || !body.ip || !body.details) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要字段'
      }, { status: 400 });
    }
    
    // 使用Supabase创建安全日志
    const { data: newLog, error } = await supabase
      .from('security_logs')
      .insert({
        type: body.type,
        level: body.level,
        user: body.user,
        ip: body.ip,
        details: body.details,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('创建安全日志失败:', error);
      return NextResponse.json({ 
        success: false, 
        error: '创建安全日志失败: ' + error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      data: newLog
    }, { status: 201 });
  } catch (error) {
    console.error('创建安全日志失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '创建安全日志失败: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 