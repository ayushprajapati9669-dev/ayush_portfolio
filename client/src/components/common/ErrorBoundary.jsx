import React from 'react';

/**
 * High-reliability React Error Boundary for production.
 * Catches unhandled runtime exceptions in 3D canvas, WebGL shaders, Web Audio,
 * GSAP animations, or CMS rendering, preventing full-screen whiteout.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[Portfolio ErrorBoundary] Caught unhandled runtime error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      window.location.reload();
    } catch (_err) {
      window.location.href = '/';
    }
  };

  handleResetState = () => {
    try {
      localStorage.removeItem('argon_portfolio_client_state_v4');
      window.location.href = '/';
    } catch (_err) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center z-50 relative">
          <div className="max-w-md w-full rounded-2xl border border-amber-400/25 bg-[#0a0d14]/95 p-7 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xl font-bold mx-auto shadow-lg shadow-amber-400/10">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {this.props.title || 'Component Recovered Safely'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {this.props.message || 'An unexpected rendering condition occurred. The rest of the portfolio remains fully active.'}
              </p>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-left font-mono text-[10px] text-rose-300 max-h-28 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono transition-colors shadow-md shadow-amber-400/20"
              >
                Reload View
              </button>
              <button
                type="button"
                onClick={this.handleResetState}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono transition-colors"
              >
                Reset Cache & Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

