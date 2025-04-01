"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '/supabaseClient';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenError, setTokenError] = useState('');
  
  useEffect(() => {
    const hashFragment = window.location.hash;
    
    // 楠岃瘉URL涓槸鍚﹀寘鍚护鐗?
    if (!hashFragment || !hashFragment.includes('access_token=')) {
      setTokenError('鏃犳晥鐨勫瘑鐮侀噸缃摼鎺ワ紝璇峰皾璇曢噸鏂拌幏鍙栭噸缃摼鎺?);
    }
  }, []);
  
  const validateForm = () => {
    if (!password) {
      setError('璇疯緭鍏ユ柊瀵嗙爜');
      return false;
    }
    
    if (password.length < 6) {
      setError('瀵嗙爜鑷冲皯闇€瑕?涓瓧绗?);
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('涓ゆ杈撳叆鐨勫瘑鐮佷笉涓€鑷?);
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // 浣跨敤Supabase鏇存柊瀵嗙爜
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setSuccess('瀵嗙爜閲嶇疆鎴愬姛锛?);
      
      // 3绉掑悗鑷姩璺宠浆鍒扮櫥褰曢〉
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      console.error('閲嶇疆瀵嗙爜澶辫触:', err);
      setError(err instanceof Error ? err.message : '瀵嗙爜閲嶇疆杩囩▼涓嚭閿欙紝璇风◢鍚庨噸璇?);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-900">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">閲嶇疆瀵嗙爜</h1>
          <p className="text-gray-400 mt-2">璇疯缃偍鐨勬柊瀵嗙爜</p>
        </div>
        
        {tokenError ? (
          <div className="space-y-6">
            <div className="bg-red-900/50 border border-red-700 rounded-lg text-red-200 p-4">
              {tokenError}
            </div>
            <div className="text-center">
              <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300">
                杩斿洖鎵惧洖瀵嗙爜椤甸潰
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
                <p>{success}</p>
                <p className="mt-2 text-sm">鍗冲皢璺宠浆鍒扮櫥褰曢〉闈?..</p>
              </div>
            )}
            
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    鏂板瘑鐮?<span className="text-red-400">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="杈撳叆鏂板瘑鐮?
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    纭鏂板瘑鐮?<span className="text-red-400">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="鍐嶆杈撳叆鏂板瘑鐮?
                    required
                    disabled={loading}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                      澶勭悊涓?..
                    </>
                  ) : (
                    '閲嶇疆瀵嗙爜'
                  )}
                </button>
                
                <div className="text-center">
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm">
                    杩斿洖鐧诲綍
                  </Link>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
} 