"use client";
import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Enhanced Order Wizard Error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="m-4">
          <div className="text-center">
            <i className="pi pi-exclamation-triangle text-6xl text-red-500 mb-4"></i>
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            
            <Message 
              severity="error" 
              text={this.state.error?.toString() || 'An unexpected error occurred'} 
              className="mb-4 w-full"
            />
            
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="text-left mb-4 p-4 bg-gray-100 rounded">
                <summary className="cursor-pointer font-semibold mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2 justify-center">
              <Button 
                label="Try Again" 
                icon="pi pi-refresh" 
                onClick={this.handleReset}
              />
              <Button 
                label="Go Back" 
                icon="pi pi-arrow-left" 
                className="p-button-secondary"
                onClick={() => window.history.back()}
              />
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;