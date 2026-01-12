import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorPages.css';

const AccessDenied = () => {
  return (
    <div className="error-page access-denied-page">
      <div className="error-container">
        <div className="error-content">
          <div className="error-number">403</div>
          <div className="error-illustration">
            <div className="lock-icon">🔒</div>
          </div>
          <h1 className="error-title">Доступ запрещен</h1>
          <p className="error-description">
            У вас нет прав для доступа к этой странице. Возможно, требуется авторизация 
            или у вас недостаточно привилегий.
          </p>

          <div className="access-info">
            <div className="access-card">
              <h3>Возможные причины:</h3>
              <ul>
                <li>Вы не авторизованы на сайте</li>
                <li>У вашей учетной записи недостаточно прав</li>
                <li>Страница доступна только администраторам</li>
                <li>Истек срок действия сессии</li>
              </ul>
            </div>
          </div>

          <div className="error-actions">
            <Link to="/login" className="error-btn primary">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Войти в систему
            </Link>
            
            <Link to="/register" className="error-btn secondary">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Зарегистрироваться
            </Link>

            <Link to="/" className="error-btn ghost">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              На главную
            </Link>
          </div>

          <div className="permission-request">
            <h3>Нужен доступ?</h3>
            <p>Если вы считаете, что должны иметь доступ к этой странице, свяжитесь с администратором:</p>
            <div className="contact-admin">
              <a href="mailto:admin@flowershop.com" className="admin-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Написать администратору
              </a>
            </div>
          </div>
        </div>
        
        <div className="error-footer">
          <p>Для запроса доступа укажите ваш логин и причину обращения</p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;