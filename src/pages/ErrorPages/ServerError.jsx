import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ErrorPages.css';

const ServerError = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="error-page server-error-page">
      <div className="error-container">
        <div className="error-content">
          <div className="error-number">500</div>
          <div className="error-illustration">
            <div className="error-icon">⚠️</div>
          </div>
          <h1 className="error-title">Ошибка сервера</h1>
          <p className="error-description">
            На сервере произошла непредвиденная ошибка. Мы уже работаем над решением проблемы.
            Пожалуйста, попробуйте обновить страницу через несколько минут.
          </p>
          
          <div className="error-status">
            <div className="status-item">
              <span className="status-label">Статус:</span>
              <span className="status-value error">Сервер недоступен</span>
            </div>
            <div className="status-item">
              <span className="status-label">Время:</span>
              <span className="status-value">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="error-actions">
            <button 
              className="error-btn primary"
              onClick={() => window.location.reload()}
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Обновить страницу
            </button>
            
            <Link to="/" className="error-btn secondary">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              На главную
            </Link>

            <button 
              className="error-btn ghost"
              onClick={() => setShowDetails(!showDetails)}
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showDetails ? 'Скрыть детали' : 'Показать детали'}
            </button>
          </div>

          {showDetails && (
            <div className="error-details">
              <h3>Технические детали:</h3>
              <div className="details-content">
                <p><strong>Код ошибки:</strong> ERR_SERVER_500</p>
                <p><strong>Тип:</strong> Внутренняя ошибка сервера</p>
                <p><strong>Вероятная причина:</strong> Проблема с подключением к базе данных или временная перегрузка сервера</p>
                <p><strong>Рекомендации:</strong> Попробуйте позже или свяжитесь с технической поддержкой</p>
              </div>
            </div>
          )}

          <div className="maintenance-info">
            <h3>Что вы можете сделать:</h3>
            <ul className="suggestions-list">
              <li>Попробуйте обновить страницу через 2-3 минуты</li>
              <li>Очистите кэш браузера</li>
              <li>Проверьте интернет-подключение</li>
              <li>Свяжитесь с нашей поддержкой</li>
            </ul>
          </div>
        </div>
        
        <div className="error-footer">
          <p>Техническая поддержка: <a href="mailto:support@flowershop.com">support@flowershop.com</a> | Телефон: <a href="tel:+78001234567">8 (800) 123-45-67</a></p>
        </div>
      </div>
    </div>
  );
};

export default ServerError;