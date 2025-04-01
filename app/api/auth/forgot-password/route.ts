import { NextResponse } from 'next/server';
import { supabase } from '/supabaseClient';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: '璇锋彁渚涢偖绠卞湴鍧€' 
      }, { status: 400 });
    }

    // 楠岃瘉閭鏍煎紡
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        error: '璇锋彁渚涙湁鏁堢殑閭鍦板潃' 
      }, { status: 400 });
    }

    // 剧疆閲嶅畾鍚慤RL锛堢敓х幆澧冧娇ㄥ煙鍚嶏紝寮€戠幆澧冧娇╨ocalhost锛?
    const redirectTo = process.env.NODE_ENV === 'production'
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
      : 'http://localhost:3000/auth/reset-password';

    // 跨敤Supabase戦€侀噸缃瘑鐮侀偖浠?
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (error) {
      console.error('閲嶇疆瀵嗙爜閿欒:', error);
      return NextResponse.json({ 
        success: false, 
        error: '戦€侀噸缃瘑鐮侀偖浠跺け璐ワ細' + error.message 
      }, { status: 500 });
    }

    // 鍦ㄥ紑戠幆澧冧腑锛屽彲浠ユ彁渚涙祴璇曚俊鎭?
    let devMessage = '';
    if (process.env.NODE_ENV !== 'production') {
      devMessage = '寮€戠幆澧冩彁绀猴細妫€鏌ユ帶跺彴鏃ュ織鏌ョ湅閲嶇疆閾炬帴';
      console.log(`寮€戠幆澧冿細宸插 ${email} 戣捣瀵嗙爜閲嶇疆璇锋眰锛岄噸氬悜? ${redirectTo}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: '閲嶇疆瀵嗙爜閭欢宸插彂閫侊紝璇锋鏌ユ偍勯偖绠? + (devMessage ? ` (${devMessage})` : '')
    });

  } catch (error) {
    console.error('閲嶇疆瀵嗙爜澶勭悊杩囩▼涓嚭閿?', error);
    return NextResponse.json({ 
      success: false, 
      error: '澶勭悊閲嶇疆瀵嗙爜璇锋眰鏃跺嚭閿? 
    }, { status: 500 });
  }
} 