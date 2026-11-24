import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable = error?.message || 'An unexpected error occurred.';
    try {
      const parsed = JSON.parse(readable);
      if (parsed && typeof parsed.error === 'string') {
        readable = `Database permission or sync issue (${parsed.operationType || 'read'}): ${parsed.error}`;
      }
    } catch {
      // plain error message
    }
    return { hasError: true, message: readable };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Beatz by Baker ErrorBoundary caught:', error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-[#09090E] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border border-rose-500/40 bg-[#11131C] p-6 space-y-4">
          <div className="flex items-center gap-3 text-rose-300">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <h1 className="font-display text-lg font-bold text-slate-100">
              Something went wrong
            </h1>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed break-words">
            {this.state.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Beatz by Baker</span>
          </button>
        </div>
      </div>
    );
  }
}
