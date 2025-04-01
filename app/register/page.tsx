"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { setLogin } from "../../lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name) newErrors.name = "请输入用户名";
    if (!email) newErrors.email = "请输入邮箱地址";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "请输入有效的邮箱地址";
    
    if (!password) newErrors.password = "请输入密码";
    else if (password.length < 6) newErrors.password = "密码至少需要6个字符";
    
    if (password !== confirmPassword) newErrors.confirmPassword = "两次输入的密码不一致";
    if (!agreeTerms) newErrors.agreeTerms = "请同意服务条款和隐私政策";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setSuccess(data.message || "注册成功");
          
          // 检查是否需要邮箱验证
          if (data.data?.needsEmailVerification) {
            setNeedsVerification(true);
          } else {
            // 如果注册接口同时返回了用户信息和token，可以直接设置登录状态
            if (data.user && data.token) {
              setLogin(data.user, data.token);
              
              // 触发auth-change事件，通知其他组件登录状态已更改
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('auth-change'));
              }
            }
            
            // 注册成功后延迟跳转到登录页
            setTimeout(() => {
              router.push('/login');
            }, 2000);
          }
        } else {
          // 处理服务器返回的错误
          setErrors({
            submit: data.error || '注册失败，请重试'
          });
        }
      } catch (error) {
        console.error('注册过程中出错:', error);
        setErrors({
          submit: '注册过程中发生错误，请稍后重试'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center">
            <span className="text-blue-500 text-3xl">✨</span>
            <span className="font-bold text-2xl text-white ml-2">提示精灵</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">创建您的账号</h2>
          <p className="mt-2 text-sm text-gray-400">
            已有账号?{" "}
            <Link href="/login" className="font-medium text-blue-500 hover:text-blue-400">
              立即登录
            </Link>
          </p>
        </div>
        
        {success && (
          <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded">
            <p className="font-bold">{success}</p>
            {needsVerification && (
              <p>请检查您的邮箱并点击验证链接完成注册。</p>
            )}
          </div>
        )}
        
        {errors.submit && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">
            <p>{errors.submit}</p>
          </div>
        )}
        
        {!success && (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                用户名
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.name ? "border-red-500" : "border-gray-700"
                  } rounded-md shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="选择一个用户名"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                邮箱地址
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? "border-red-500" : "border-gray-700"
                  } rounded-md shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="您的邮箱地址"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                密码
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? "border-red-500" : "border-gray-700"
                  } rounded-md shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="创建密码"
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                确认密码
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-700"
                  } rounded-md shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="再次输入密码"
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded ${
                  errors.agreeTerms ? "border-red-500" : ""
                }`}
                disabled={isSubmitting}
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-300">
                我同意
                <Link href="/terms" className="text-blue-500 hover:text-blue-400 mx-1">
                  服务条款
                </Link>
                和
                <Link href="/privacy" className="text-blue-500 hover:text-blue-400 mx-1">
                  隐私政策
                </Link>
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-sm text-red-400">{errors.agreeTerms}</p>
            )}

            <div>
              <button
                type="submit"
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    处理中...
                  </span>
                ) : "注册账号"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">或通过以下方式注册</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
                disabled={isSubmitting}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H12.7031V12.0492H16.9574C16.7448 13.2911 15.9932 14.3898 14.8630 15.0879V17.5866H17.6938C19.3910 16.0078 20.3081 13.3461 20.3081 10.2303Z" fill="#4285F4"/>
                  <path d="M12.7031 20.0006C15.0169 20.0006 16.9656 19.1151 17.6939 17.5865L14.8632 15.0879C14.0179 15.6979 13.1235 16.0433 12.7031 16.0433C10.9689 16.0433 9.23332 14.7715 8.67535 12.9450H5.87695V15.5460C6.71486 17.8900 9.13278 20.0006 12.7031 20.0006Z" fill="#34A853"/>
                  <path d="M8.67491 12.9450C8.53453 12.3350 8.45848 11.6929 8.45848 11.0000C8.45848 10.3069 8.54356 9.66499 8.67491 9.05493V6.45398H5.87652C5.35375 7.52864 5.05078 8.73065 5.05078 10.0000C5.05078 11.2705 5.35375 12.4725 5.87652 13.5461L8.67491 12.9450Z" fill="#FBBC05"/>
                  <path d="M12.7031 5.95694C13.8088 5.95694 14.8102 6.37016 15.5788 7.10102L18.0245 4.65535C16.9606 3.66699 15.0064 3.00006 12.7031 3.00006C9.13275 3.00006 6.71486 5.11063 5.87695 7.45401L8.67533 9.05496C9.23331 7.22835 10.9688 5.95694 12.7031 5.95694Z" fill="#EA4335"/>
                </svg>
              </button>
            </div>

            <div>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
                disabled={isSubmitting}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                </svg>
              </button>
            </div>

            <div>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
                disabled={isSubmitting}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 