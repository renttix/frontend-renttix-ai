"use client";

import React from "react";
import { Button } from "primereact/button";
import { Message } from "primereact/message";

class CalendarErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to error reporting service
    console.error('Calendar Error:', error, errorInfo);
    
    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Send error to monitoring service (e.g., Sentry)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Optionally reload the page if errors persist
    if (this.state.errorCount > 3) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="calendar-error-boundary p-6 text-center">
          <div className="max-w-2xl mx-auto">
            <i className="pi pi-exclamation-triangle text-6xl text-red-500 mb-4"></i>
            
            <h2 className="text-2xl font-bold mb-4">
              Oops! Something went wrong with the calendar
            </h2>
            
            <Message 
              severity="error" 
              text={this.state.error?.message || "An unexpected error occurred"}
              className="mb-4 w-full"
            />
            
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="text-left mb-4 p-4 bg-gray-100 rounded-lg">
                <summary className="cursor-pointer font-semibold mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button
                label="Try Again"
                icon="pi pi-refresh"
                onClick={this.handleReset}
                severity="primary"
              />
              
              <Button
                label="Go to Dashboard"
                icon="pi pi-home"
                onClick={() => window.location.href = '/dashboard'}
                severity="secondary"
                outlined
              />
            </div>
            
            {this.state.errorCount > 1 && (
              <p className="text-sm text-gray-600 mt-4">
                If the problem persists, please contact support.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CalendarErrorBoundary;