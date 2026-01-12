import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthForm.css';

export default function AuthForm({ type = 'login' }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (type === 'register') {
      if (!formData.firstName) {
        newErrors.firstName = 'Имя обязательно';
      }

      if (!formData.lastName) {
        newErrors.lastName = 'Фамилия обязательна';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Пароли не совпадают';
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'Необходимо согласие с условиями';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (type === 'register') {
        const result = await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });

        if (result.success) {
          navigate('/profile');
        } else {
          setErrors({ submit: result.message });
        }
      } else {
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          navigate('/');
        } else {
          setErrors({ submit: result.message });
        }
      }
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      setErrors({ submit: 'Произошла ошибка. Попробуйте снова.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Вход через ${provider}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-flower-decoration">
          <div className="flower-1">🌸</div>
          <div className="flower-2">🌺</div>
          <div className="flower-3">🌷</div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 16C16 10 20 6 26 6C26 12 22 16 16 16Z" fill="#C7A7E7" stroke="#8BC9A1" strokeWidth="2"/>
              <path d="M16 16C16 22 12 26 6 26C6 20 10 16 16 16Z" fill="#8BC9A1" stroke="#C7A7E7" strokeWidth="2"/>
              <path d="M16 16C10 16 6 12 6 6C12 6 16 10 16 16Z" fill="#A8D5BA" stroke="#8BC9A1" strokeWidth="2"/>
              <path d="M16 16C22 16 26 20 26 26C20 26 16 22 16 16Z" fill="#C7A7E7" stroke="#8BC9A1" strokeWidth="2"/>
              <circle cx="16" cy="16" r="4" fill="#F5ECD7" stroke="#8BC9A1" strokeWidth="2"/>
            </svg>
            <span>Floral Bliss</span>
          </div>
          <h1>{type === 'login' ? 'Вход в аккаунт' : 'Регистрация'}</h1>
          <p>
            {type === 'login' 
              ? 'Войдите, чтобы продолжить покупки' 
              : 'Создайте аккаунт для удобных покупок'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {type === 'register' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Имя</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Введите ваше имя"
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Фамилия</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Введите вашу фамилию"
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="your@email.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {type === 'register' && (
            <div className="form-group">
              <label htmlFor="phone">Телефон (необязательно)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (999) 999-99-99"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Введите пароль"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {type === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Подтвердите пароль</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Повторите пароль"
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          )}

          {type === 'register' && (
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={errors.agreeToTerms ? 'error' : ''}
                />
                <span className="checkmark"></span>
                <span className="checkbox-text">
                  Я соглашаюсь с <a href="/terms" target="_blank" rel="noopener noreferrer">условиями использования</a> и{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">политикой конфиденциальности</a>
                </span>
              </label>
              {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}
            </div>
          )}

          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              type === 'login' ? 'Войти' : 'Зарегистрироваться'
            )}
          </button>

          <div className="auth-divider">
            <span>или продолжите с помощью</span>
          </div>

          <div className="social-buttons">
            <button 
              type="button" 
              className="social-btn google-btn"
              onClick={() => handleSocialLogin('Google')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

            <button 
              type="button" 
              className="social-btn yandex-btn"
              onClick={() => handleSocialLogin('Yandex')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#FC3F1D" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16v-6H8v-2h3V8h2v2h3v2h-3v6h-2z"/>
              </svg>
              Yandex
            </button>
          </div>

          <div className="auth-switch">
            {type === 'login' ? (
              <>
                Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
              </>
            ) : (
              <>
                Уже есть аккаунт? <Link to="/login">Войти</Link>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}