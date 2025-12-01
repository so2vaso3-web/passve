"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-900 dark:to-dark-800 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-100 mb-2">
            Chào mừng đến
          </h1>
          <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            Pass Vé Phim
          </h2>
          <p className="text-dark-600 dark:text-dark-400">
            Đăng nhập để tiếp tục
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 border border-dark-200 dark:border-dark-700">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-100 border-2 border-dark-300 dark:border-dark-600 hover:bg-dark-50 dark:hover:bg-dark-600 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-200"
            size="lg"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang đăng nhập...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Đăng nhập với Google
              </>
            )}
          </Button>

          <div className="mt-6 pt-6 border-t border-dark-200 dark:border-dark-700">
            <p className="text-xs text-dark-500 dark:text-dark-400 text-center leading-relaxed">
              Bằng cách đăng nhập, bạn đồng ý với{" "}
              <a href="/terms" className="text-primary-500 hover:underline font-medium">
                Điều khoản sử dụng
              </a>{" "}
              và{" "}
              <a href="/privacy" className="text-primary-500 hover:underline font-medium">
                Chính sách bảo mật
              </a>{" "}
              của chúng tôi.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="text-dark-600 dark:text-dark-400">
            <div className="text-2xl mb-1">🔒</div>
            <div className="text-xs font-medium">An toàn</div>
          </div>
          <div className="text-dark-600 dark:text-dark-400">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs font-medium">Nhanh chóng</div>
          </div>
          <div className="text-dark-600 dark:text-dark-400">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-xs font-medium">Đáng tin cậy</div>
          </div>
        </div>
      </div>
    </div>
  );
}

