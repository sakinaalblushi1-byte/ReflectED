/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      let errorDetails = null;
      try {
        // Try to parse the error message if it's our JSON error info
        const errorMsg = this.state.error?.message || '';
        errorDetails = JSON.parse(errorMsg);
      } catch (e) {
        // Not our JSON error info
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full glass-card p-8 rounded-3xl space-y-8 text-center">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={40} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-display font-bold text-slate-900">Something went wrong</h1>
              <p className="text-slate-500">We encountered an unexpected error. Our team has been notified.</p>
            </div>

            {errorDetails && (
              <div className="bg-slate-900 rounded-2xl p-6 text-left overflow-auto max-h-60">
                <p className="text-primary-400 font-mono text-xs mb-2 uppercase tracking-widest">Error Context</p>
                <pre className="text-slate-300 font-mono text-xs whitespace-pre-wrap">
                  {JSON.stringify(errorDetails, null, 2)}
                </pre>
              </div>
            )}

            {!errorDetails && (
              <div className="bg-slate-100 rounded-2xl p-4 text-left">
                <p className="text-slate-600 font-mono text-xs break-words">
                  {this.state.error?.message || 'Unknown error'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
              >
                <RefreshCw size={20} />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
              >
                <Home size={20} />
                Go to Dashboard
              </button>
            </div>

            <p className="text-xs text-slate-400">
              If the problem persists, please contact support with the error details above.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
