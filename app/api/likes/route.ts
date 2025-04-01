import { NextResponse } from 'next/server';
import { supabase } from '/supabaseClient';

// 娣诲姞鎴栧垹闄ょ偣璧?
export async function POST(request: Request) {
  try {
    const { prompt_id, user_id, action } = await request.json();

    // 楠岃瘉蹇呭～瀛楁
    if (!prompt_id || !user_id) {
      return NextResponse.json({
        success: false,
        error: '缂哄皯蹇呰鍙傛暟'
      }, { status: 400 });
    }

    // 楠岃瘉鎿嶄綔绫诲瀷
    if (action !== 'like' && action !== 'unlike') {
      return NextResponse.json({
        success: false,
        error: '鏃犳晥鐨勬搷浣滅被鍨?
      }, { status: 400 });
    }

    // 妫€鏌ユ彁绀鸿瘝鏄惁瀛樺湪
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('id, likes')
      .eq('id', prompt_id)
      .single();

    if (promptError) {
      return NextResponse.json({
        success: false,
        error: '鎻愮ず璇嶄笉瀛樺湪'
      }, { status: 404 });
    }

    // 褰撳墠鐐硅禐鏁?
    const currentLikes = prompt.likes || 0;

    if (action === 'like') {
      // 妫€鏌ユ槸鍚﹀凡缁忕偣璧?
      const { data: existingLike, error: likeCheckError } = await supabase
        .from('likes')
        .select('*')
        .eq('prompt_id', prompt_id)
        .eq('user_id', user_id)
        .single();

      if (!existingLike) {
        // 娣诲姞鐐硅禐璁板綍
        const { error: insertError } = await supabase
          .from('likes')
          .insert({
            prompt_id,
            user_id,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('娣诲姞鐐硅禐璁板綍澶辫触:', insertError);
          return NextResponse.json({
            success: false,
            error: '娣诲姞鐐硅禐澶辫触'
          }, { status: 500 });
        }

        // 鏇存柊鎻愮ず璇嶇偣璧炴暟
        const { error: updateError } = await supabase
          .from('prompts')
          .update({ likes: currentLikes + 1 })
          .eq('id', prompt_id);

        if (updateError) {
          console.error('鏇存柊鐐硅禐鏁板け璐?', updateError);
          return NextResponse.json({
            success: false,
            error: '鏇存柊鐐硅禐鏁板け璐?
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: '鐐硅禐鎴愬姛',
          data: { likes: currentLikes + 1 }
        });
      } else {
        // 宸茬粡鐐硅禐杩?
        return NextResponse.json({
          success: false,
          error: '宸茬粡鐐硅禐杩囪鎻愮ず璇?
        }, { status: 400 });
      }
    } else {
      // 鍙栨秷鐐硅禐
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('prompt_id', prompt_id)
        .eq('user_id', user_id);

      if (deleteError) {
        console.error('鍒犻櫎鐐硅禐璁板綍澶辫触:', deleteError);
        return NextResponse.json({
          success: false,
          error: '鍙栨秷鐐硅禐澶辫触'
        }, { status: 500 });
      }

      // 鏇存柊鎻愮ず璇嶇偣璧炴暟
      const newLikes = Math.max(0, currentLikes - 1); // 纭繚涓嶄細涓鸿礋鏁?
      const { error: updateError } = await supabase
        .from('prompts')
        .update({ likes: newLikes })
        .eq('id', prompt_id);

      if (updateError) {
        console.error('鏇存柊鐐硅禐鏁板け璐?', updateError);
        return NextResponse.json({
          success: false,
          error: '鏇存柊鐐硅禐鏁板け璐?
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: '鍙栨秷鐐硅禐鎴愬姛',
        data: { likes: newLikes }
      });
    }
  } catch (error) {
    console.error('鐐硅禐鎿嶄綔鍑洪敊:', error);
    return NextResponse.json({
      success: false,
      error: '鏈嶅姟鍣ㄩ敊璇?
    }, { status: 500 });
  }
}

// 鑾峰彇鐢ㄦ埛鐐硅禐鐨勬彁绀鸿瘝
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: '缂哄皯鐢ㄦ埛ID鍙傛暟'
      }, { status: 400 });
    }

    // 鑾峰彇鐢ㄦ埛鐐硅禐鐨勬墍鏈夋彁绀鸿瘝ID
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('prompt_id')
      .eq('user_id', user_id);

    if (likesError) {
      console.error('鑾峰彇鐢ㄦ埛鐐硅禐鍒楄〃澶辫触:', likesError);
      return NextResponse.json({
        success: false,
        error: '鑾峰彇鐐硅禐鍒楄〃澶辫触'
      }, { status: 500 });
    }

    // 鎻愬彇鎻愮ず璇岻D
    const promptIds = likes.map(like => like.prompt_id);

    if (promptIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // 鑾峰彇鐢ㄦ埛鐐硅禐鐨勬墍鏈夋彁绀鸿瘝璇︽儏
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select(`
        *,
        user:user_id (id, name, email, role, avatar_url),
        category:category_id (id, name, icon)
      `)
      .in('id', promptIds)
      .order('created_at', { ascending: false });

    if (promptsError) {
      console.error('鑾峰彇鐐硅禐鎻愮ず璇嶈鎯呭け璐?', promptsError);
      return NextResponse.json({
        success: false,
        error: '鑾峰彇鐐硅禐鎻愮ず璇嶈鎯呭け璐?
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: prompts
    });
  } catch (error) {
    console.error('鑾峰彇鐢ㄦ埛鐐硅禐鍒楄〃鍑洪敊:', error);
    return NextResponse.json({
      success: false,
      error: '鏈嶅姟鍣ㄩ敊璇?
    }, { status: 500 });
  }
} 