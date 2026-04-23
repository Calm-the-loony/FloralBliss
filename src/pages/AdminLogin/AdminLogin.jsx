import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../config';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/admin/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Ошибка входа');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 16C16 10 20 6 26 6C26 12 22 16 16 16Z" fill="#C7A7E7" stroke="#8BC9A1" strokeWidth="2" />
              <path d="M16 16C16 22 12 26 6 26C6 20 10 16 16 16Z" fill="#8BC9A1" stroke="#C7A7E7" strokeWidth="2" />
              <path d="M16 16C10 16 6 12 6 6C12 6 16 10 16 16Z" fill="#A8D5BA" stroke="#8BC9A1" strokeWidth="2" />
              <path d="M16 16C22 16 26 20 26 26C20 26 16 22 16 16Z" fill="#C7A7E7" stroke="#8BC9A1" strokeWidth="2" />
              <circle cx="16" cy="16" r="4" fill="#F5ECD7" stroke="#8BC9A1" strokeWidth="2" />
            </svg>
            <span>Floral Bliss</span>
          </div>
          <h1>Админ-панель</h1>
          <p>Вход для администраторов</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email администратора"
              className={error ? 'error' : ''}
            />
          </div>

          <div className="admin-form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Пароль"
              className={error ? 'error' : ''}
            />
          </div>

          {error && <div className="admin-error-message">{error}</div>}

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}