"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '/supabaseClient';

export default function EmailConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('姝ｅ湪楠岃瘉鎮ㄧ殑閭...');

  // 澶勭悊閭楠岃瘉
  async function confirmEmail() {
    try {
      // 浠嶶RL鑾峰彇鍙傛暟
      const tokenHash = searchParams?.get('token_hash');
      const type = searchParams?.get('type');

      // 楠岃瘉鍙傛暟
      if (!tokenHash || !type) {
        setStatus('error');
        setMessage('鏃犳晥鐨勯獙璇侀摼鎺?);
        return;
      }

      // 楠岃瘉閭
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as any,
      });

      if (error) {
        console.error('閭楠岃瘉閿欒:', error);
        setStatus('error');
        setMessage(error.message || '楠岃瘉澶辫触锛岃灏濊瘯閲嶆柊娉ㄥ唽鎴栬仈绯诲鏈?);
        return;
      }

      if (!data.user) {
        setStatus('error');
        setMessage('楠岃瘉澶辫触锛屾壘涓嶅埌鐢ㄦ埛淇℃伅');
        return;
      }

      // 妫€鏌sers琛ㄤ腑鏄惁宸叉湁璇ョ敤鎴?
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // 濡傛灉鐢ㄦ埛璧勬枡涓嶅瓨鍦紝鍒涘缓鐢ㄦ埛璧勬枡
      if (userError || !existingUser) {
        // 浣跨敤鐢ㄦ埛鍏冩暟鎹腑鐨刵ame鍒涘缓璧勬枡
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
            role: 'user',
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('鍒涘缓鐢ㄦ埛璧勬枡澶辫触:', insertError);
          // 缁х画鎵ц锛屽洜涓洪獙璇佹湰韬凡鎴愬姛
        }
      }

      setStatus('success');
      setMessage('閭楠岃瘉鎴愬姛锛佹偍鐜板湪鍙互鐧诲綍浜嗐€?);

      // 3绉掑悗閲嶅畾鍚戝埌鐧诲綍椤?
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      console.error('閭楠岃瘉杩囩▼涓嚭閿?', error);
      setStatus('error');
      setMessage('楠岃瘉杩囩▼涓彂鐢熼敊璇紝璇风◢鍚庡啀璇?);
    }
  }

  useEffect(() => {
    confirmEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-900">
      <div className="card max-w-md w-full p-8 text-center">
        <h1 className="text-2xl font-bold mb-6">閭楠岃瘉</h1>

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-300">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 bg-green-900/20 text-green-400 p-3 rounded-full">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-300 mb-6">{message}</p>
            <Link href="/login" className="btn-primary">
              鍓嶅線鐧诲綍椤?
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 bg-red-900/20 text-red-400 p-3 rounded-full">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="flex space-x-4">
              <Link href="/register" className="btn-primary">
                閲嶆柊娉ㄥ唽
              </Link>
              <Link href="/contact" className="btn-outline">
                鑱旂郴瀹㈡湇
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 