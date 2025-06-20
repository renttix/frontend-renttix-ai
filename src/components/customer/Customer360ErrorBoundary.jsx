import React from 'react';
import { Button } from 'primereact/button';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class Customer360ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Customer 360 Error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-content">
            <FiAlertTriangle className="error-icon" />
            <h2 className="error-title">Oops! Something went wrong</h2>
            <p className="error-message">
              We encountered an error while loading the customer information.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
            <div className="error-actions">
              <Button
                label="Reload Page"
                icon={<FiRefreshCw />}
                className="p-button-primary"
                onClick={this.handleReset}
              />
              <Button
                label="Go Back"
                className="p-button-secondary"
                onClick={() => window.history.back()}
              />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default Customer360ErrorBoundary;