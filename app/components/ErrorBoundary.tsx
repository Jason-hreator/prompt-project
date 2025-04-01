'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary捕获到错误:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，则使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // 默认错误UI
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-4">页面加载出错</h2>
          <div className="bg-white p-4 rounded shadow mb-4 overflow-auto">
            <p className="font-mono text-sm">{this.state.error?.message}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 