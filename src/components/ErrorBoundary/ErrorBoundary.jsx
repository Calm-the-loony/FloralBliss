import React from 'react';
import NetworkError from '../../pages/ErrorPages/NetworkError';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      isOnline: navigator.onLine
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // В development показываем полную информацию
    if (process.env.NODE_ENV === 'development') {
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ isOnline: true });
  }

  handleOffline = () => {
    this.setState({ isOnline: false });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  }

  render() {
    if (!this.state.isOnline) {
      return <NetworkError />;
    }

    if (this.state.hasError) {
      return (
        <div className="error-boundary-page">
          <div className="error-boundary-container">
            <div className="error-boundary-content">
              <div className="error-illustration">
                <div className="error-icon">💐</div>
              </div>
              <h1 className="error-title">Что-то пошло не так</h1>
              <p className="error-description">
                В приложении произошла непредвиденная ошибка. Мы уже работаем над ее решением.
              </p>
              
              {/* Техническая информация только для разработки */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="error-details">
                  <details>
                    <summary>Техническая информация</summary>
                    <div className="details-content">
                      <pre>{this.state.error.toString()}</pre>
                    </div>
                  </details>
                </div>
              )}

              <div className="error-actions">
                <button 
                  className="error-btn primary"
                  onClick={this.handleReset}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Перезагрузить страницу
                </button>
                
                <button 
                  className="error-btn secondary"
                  onClick={() => window.location.href = '/'}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  На главную
                </button>
              </div>

              <div className="error-help">
                <p>
                  Если ошибка повторяется, пожалуйста,{' '}
                  <a href="mailto:support@flowershop.com?subject=Ошибка в приложении">
                    свяжитесь с поддержкой
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;