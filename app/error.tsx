'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到控制台
    console.error('页面错误:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-xl w-full bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-red-500 mb-4">出错了</h2>
        <div className="bg-gray-900 p-4 rounded mb-6 overflow-auto">
          <p className="text-white mb-2">错误信息:</p>
          <pre className="text-red-400 text-sm whitespace-pre-wrap">
            {error.message || 'An unexpected error occurred'}
          </pre>
          
          {error.digest && (
            <p className="text-gray-400 text-xs mt-2">
              错误ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            重试
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
} 