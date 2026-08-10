import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="panel" style={{ padding: '20px', margin: '20px auto', maxWidth: '400px', textAlign: 'center' }}>
          <h3 style={{ color: '#ef4444' }}>⚠️ Bir Hata Oluştu</h3>
          <p className="hint" style={{ margin: '10px 0', wordBreak: 'break-word' }}>
            {this.state.error?.toString()}
          </p>
          <button
            className="btn btn--primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
          >
            Yeniden Dene / Ana Menüye Dön
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
