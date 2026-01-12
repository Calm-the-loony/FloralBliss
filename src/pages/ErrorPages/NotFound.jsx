import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorPages.css';

const NotFound = () => {
  return (
    <div className="error-page not-found-page">
      <div className="error-container">
        <div className="error-content">
          <div className="error-number">404</div>
          <div className="error-illustration">
            <div className="flower-error">🌸</div>
            <div className="flower-error">🌿</div>
            <div className="flower-error">🌼</div>
          </div>
          <h1 className="error-title">Страница не найдена</h1>
          <p className="error-description">
            Кажется, этот букет еще не расцвел. Страница, которую вы ищете, не существует или была перемещена.
          </p>
          <div className="error-actions">
            <Link to="/" className="error-btn primary">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              На главную
            </Link>
            <Link to="/bouquets" className="error-btn secondary">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              В каталог
            </Link>
            <button 
              className="error-btn ghost"
              onClick={() => window.history.back()}
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Вернуться назад
            </button>
          </div>
          <div className="error-search">
            <p>Или попробуйте найти нужную страницу:</p>
            <form className="search-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Поиск по сайту..."
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
        <div className="error-footer">
          <p>Если вы считаете, что это ошибка, пожалуйста, <Link to="/contact">свяжитесь с нами</Link></p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;