import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import './Profile.css';


const Icons = {
  user: '👤',
  order: '📦',
  heart: '❤️',
  edit: '✏️',
  logout: '→',
  calendar: '📅',
  flower: '🌸',
  delete: '×',
  eye: '👁',
  lock: '🔐'
};

// Простой компонент для изображений с обработкой ошибок
const SimpleImage = ({ src, alt, className }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={`${className} image-placeholder`}>
        <span>{Icons.flower}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState({
    orders: true,
    user: true
  });
  const [error, setError] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const navigate = useNavigate();
  const { user, logout, isLoggedIn, updateUser } = useAuth();
  const { favorites, getFavoritesCount, removeFromFavorites } = useFavorites();
  
  const canvasRef = useRef(null);

  // Загружаем данные пользователя
  useEffect(() => {
    const loadUserData = async () => {
      if (!isLoggedIn || !user) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, user: true }));
        setUserData(user);
        setEditForm(user);
        setError(null);
        
        await fetchOrders();
        
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(prev => ({ ...prev, user: false }));
      }
    };

    loadUserData();
  }, [user, isLoggedIn, navigate]);

  // Минималистичный фон
  useEffect(() => {
    if (canvasRef.current && userData) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const resizeCanvas = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      // Очень тонкий точечный фон
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(139, 201, 161, 0.02)';
        
        // Очень редкие точки
        for (let i = 0; i < 15; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 1.5 + 0.5;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        requestAnimationFrame(draw);
      };
      
      draw();
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [userData]);

  // Загрузка заказов
  const fetchOrders = async () => {
    try {
      setLoading(prev => ({ ...prev, orders: true }));
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:5000/api/orders/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setOrders(data.orders || data.data || []);
        } else if (data.orders) {
          setOrders(data.orders);
        } else if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
      setOrders([]);
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  // Обновление профиля
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:5000/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const updatedUser = { ...userData, ...editForm };
          setUserData(updatedUser);
          updateUser(updatedUser);
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  // Смена пароля
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setShowPasswordForm(false);
          alert('Пароль успешно изменен');
        }
      }
    } catch (error) {
      console.error('Ошибка смены пароля:', error);
      alert('Ошибка при смене пароля');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Обновить
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData || loading.user) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <canvas ref={canvasRef} className="profile-canvas" />
      
      <div className="profile-container">
        {/* Боковая панель */}
        <div className="profile-sidebar">
          <div className="sidebar-header">
            
            <div className="user-info">
              <h2>{userData.first_name || 'Пользователь'}</h2>
              <p>{userData.email}</p>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span>Личные данные</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <span>Мои заказы</span>
              {orders.length > 0 && (
                <span className="nav-count">{orders.length}</span>
              )}
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <span>Избранное</span>
              {favorites.length > 0 && (
                <span className="nav-count">{favorites.length}</span>
              )}
            </button>
          </nav>
          
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <span>Выйти</span>
              <span className="logout-icon">{Icons.logout}</span>
            </button>
          </div>
        </div>
        
        {/* Основной контент */}
        <div className="profile-main">
          {/* Профиль */}
          {activeTab === 'profile' && (
            <div className="profile-content">
              <div className="content-header">
                <h1>Личные данные</h1>
                <button 
                  className="edit-toggle"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Отмена' : 'Редактировать'}
                </button>
              </div>
              
              <div className="profile-grid">
                {/* Форма редактирования */}
                <div className="edit-section">
                  {isEditing ? (
                    <div className="edit-form">
                      <div className="form-group">
                        <label>Имя</label>
                        <input 
                          type="text" 
                          name="first_name"
                          value={editForm.first_name || editForm.firstName || ''}
                          onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Фамилия</label>
                        <input 
                          type="text" 
                          name="last_name"
                          value={editForm.last_name || editForm.lastName || ''}
                          onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input 
                          type="email" 
                          name="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Телефон</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-actions">
                        <button className="save-btn" onClick={handleSave}>
                          Сохранить изменения
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="info-list">
                      <div className="info-item">
                        <label>Имя</label>
                        <div className="info-value">{userData.first_name || userData.firstName || 'Не указано'}</div>
                      </div>
                      <div className="info-item">
                        <label>Фамилия</label>
                        <div className="info-value">{userData.last_name || userData.lastName || 'Не указано'}</div>
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <div className="info-value">{userData.email}</div>
                      </div>
                      <div className="info-item">
                        <label>Телефон</label>
                        <div className="info-value">{userData.phone || 'Не указан'}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Смена пароля */}
                <div className="password-section">
                  <h3>Безопасность</h3>
                  {showPasswordForm ? (
                    <div className="password-form">
                      <div className="form-group">
                        <label>Текущий пароль</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Новый пароль</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Подтвердите пароль</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-actions">
                        <button className="save-btn" onClick={handlePasswordChange}>
                          Сменить пароль
                        </button>
                        <button 
                          className="cancel-btn" 
                          onClick={() => setShowPasswordForm(false)}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      className="change-password-btn"
                      onClick={() => setShowPasswordForm(true)}
                    >
                      Сменить пароль
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Заказы */}
          {activeTab === 'orders' && (
            <OrdersTab 
              orders={orders} 
              loading={loading.orders}
            />
          )}
          
          {/* Избранное */}
          {activeTab === 'favorites' && (
            <FavoritesTab 
              favorites={favorites} 
              removeFromFavorites={removeFromFavorites}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Компонент заказов
const OrdersTab = ({ orders, loading }) => {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return '-';
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'new': 'Новый',
      'processing': 'В обработке',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен',
      'pending': 'В ожидании',
      'completed': 'Завершен'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="orders-content">
        <h1>Мои заказы</h1>
        <div className="loading-state">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="orders-content">
        <h1>Мои заказы</h1>
        <div className="empty-state">
          <p>У вас пока нет заказов</p>
          <Link to="/bouquets" className="primary-btn">
            Перейти к покупкам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-content">
      <h1>Мои заказы</h1>
      <div className="orders-list">
        {orders.map((order, index) => (
          <div key={order.id || index} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>Заказ #{order.order_number || order.id || '-'}</h3>
                <p className="order-date">{formatDate(order.created_at)}</p>
              </div>
              <div className={`order-status ${order.status || 'new'}`}>
                {getStatusLabel(order.status)}
              </div>
            </div>
            
            <div className="order-details">
              {order.items && Array.isArray(order.items) && order.items.map((item, idx) => (
                <div key={idx} className="order-item">
                  <span className="item-name">{item.name || item.product_name || 'Товар'}</span>
                  <span className="item-quantity">×{item.quantity || 1}</span>
                  <span className="item-price">{item.price ? `${item.price} ₽` : ''}</span>
                </div>
              ))}
            </div>
            
            <div className="order-footer">
              <div className="order-total">
                Итого: <span>{order.total_amount || order.total || 0} ₽</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Компонент избранного
const FavoritesTab = ({ favorites, removeFromFavorites }) => {
  if (!favorites || favorites.length === 0) {
    return (
      <div className="favorites-content">
        <h1>Избранное</h1>
        <div className="empty-state">
          <p>В избранном пока пусто</p>
          <Link to="/bouquets" className="primary-btn">
            Смотреть букеты
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-content">
      <h1>Избранное</h1>
      <div className="favorites-grid">
        {favorites.map(item => (
          <div key={item.id} className="favorite-item">
            <div className="favorite-image">
              <SimpleImage 
                src={item.image_url} 
                alt={item.name}
                className="favorite-img"
              />
            </div>
            <div className="favorite-info">
              <h3>{item.name || 'Букет'}</h3>
              <p className="favorite-price">{item.price ? `${item.price} ₽` : ''}</p>
              <div className="favorite-actions">
                <Link to={`/product/${item.id}`} className="view-btn">
                  Подробнее
                </Link>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromFavorites(item.id)}
                  title="Удалить из избранного"
                >
                  {Icons.delete}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};