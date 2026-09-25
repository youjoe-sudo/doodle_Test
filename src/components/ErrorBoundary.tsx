import { Component, type ReactNode, type ErrorInfo } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#FBE3E5] flex items-center justify-center mb-4 text-2xl">
            ✦
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#2C1E1B' }}>
            Something went wrong
          </h2>
          <p className="text-sm mb-6" style={{ color: '#5A4A42' }}>
            This section failed to load. Please refresh the page.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-3 rounded-full font-bold text-white"
            style={{ backgroundColor: '#C25350', boxShadow: '4px 4px 0 #2C1E1B' }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
