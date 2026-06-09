import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  name: string;
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in ${this.props.name}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', zIndex: 9999, position: 'relative', background: 'white', padding: 20, border: '2px solid black' }}>
          <h1>Component Error in {this.props.name}</h1>
          <pre>{String(this.state.error?.message || this.state.error)}</pre>
          <pre>{String(this.state.error?.stack)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
