import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ErrorPages.css';

const NetworkError = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const connectionStatus = isOnline 
    ? 'Подключение восстановлено' 
    : 'Нет подключения к интернету';

  return (
    <div className="error-page network-error-page">
      <div className="error-container">
        <div className="error-content">
          <div className="error-illustration">
            <div className="network-icon">
              {isOnline ? '📡' : '🚫'}
            </div>
            <div className="connection-animation">
              <div className={`signal ${isOnline ? 'active' : ''}`}></div>
              <div className={`signal ${isOnline ? 'active' : ''}`}></div>
              <div className={`signal ${isOnline ? 'active' : ''}`}></div>
            </div>
          </div>
          
          <h1 className="error-title">
            {isOnline ? 'Проблема с подключением' : 'Нет подключения'}
          </h1>
          
          <p className="error-description">
            {isOnline 
              ? 'Не удалось загрузить данные. Пожалуйста, проверьте подключение или попробуйте позже.'
              : 'Похоже, у вас нет подключения к интернету. Проверьте сеть и попробуйте снова.'
            }
          </p>

          <div className="connection-status">
            <div className="status-indicator">
              <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
              <span className="status-text">{connectionStatus}</span>
            </div>
            <div className="retry-counter">
              Попыток переподключения: <strong>{retryCount}</strong>
            </div>
          </div>

          <div className="error-actions">
            <button 
              className="error-btn primary"
              onClick={handleRetry}
              disabled={!isOnline && retryCount >= 3}
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isOnline ? 'Повторить попытку' : 'Проверить соединение'}
            </button>

            {!isOnline && (
              <button 
                className="error-btn secondary"
                onClick={() => {
                  if (/Android/i.test(navigator.userAgent)) {
                    window.location.href = 'android.settings.WIFI_SETTINGS';
                  } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    window.location.href = 'App-Prefs:root=WIFI';
                  }
                }}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Настройки сети
              </button>
            )}

            <Link to="/" className="error-btn ghost">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              На главную (оффлайн)
            </Link>
          </div>

          <div className="network-tips">
            <h3>Как исправить:</h3>
            <ul className="tips-list">
              <li>Проверьте подключение к Wi-Fi или мобильной сети</li>
              <li>Перезагрузите роутер/модем</li>
              <li>Отключите VPN, если используете</li>
              <li>Попробуйте другой браузер</li>
              <li>Очистите кэш браузера</li>
            </ul>
          </div>

          {retryCount >= 3 && !isOnline && (
            <div className="offline-mode">
              <h3>Оффлайн режим</h3>
              <p>Вы можете просмотреть некоторые страницы без интернета:</p>
              <div className="offline-links">
                <Link to="/" className="offline-link">Главная страница</Link>
                <Link to="/about" className="offline-link">О нас</Link>
                <Link to="/contact" className="offline-link">Контакты</Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="error-footer">
          <p>Если проблема сохраняется, свяжитесь с интернет-провайдером</p>
        </div>
      </div>
    </div>
  );
};

export default NetworkError;