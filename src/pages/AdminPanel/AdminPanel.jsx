import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../config';
import './AdminPanel.css';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({ orders: 0, users: 0, products: 0, revenue: 0, pendingOrders: 0 });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category_id: '',
    type: 'bouquet',
    size: 'medium',
    in_stock: true,
    stock_quantity: '',
    images: [],
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [productSubmitting, setProductSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (!token || !adminData) {
      navigate('/admin');
      return;
    }
    
    setAdmin(JSON.parse(adminData));
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getApiUrl('/admin/panel/stats'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getApiUrl('/admin/panel/orders'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getApiUrl('/admin/panel/users'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getApiUrl('/admin/panel/products'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(getApiUrl(`/admin/panel/orders/${orderId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const updateProductStatus = async (productId, in_stock, is_active) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(getApiUrl(`/admin/panel/products/${productId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ in_stock, is_active })
      });
      fetchProducts();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(getApiUrl(`/admin/panel/users/${userId}/role`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      fetchUsers();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const toggleUserBlock = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(getApiUrl(`/admin/panel/users/${userId}/toggle-block`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin');
  };

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newProduct.tags.includes(tagInput.trim())) {
      setNewProduct(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewProduct(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addImage = () => {
    if (imageInput.trim() && !newProduct.images.includes(imageInput.trim())) {
      setNewProduct(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput('');
    }
  };

  const removeImage = (imageToRemove) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageToRemove)
    }));
  };

  const createProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Заполните название и цену товара');
      return;
    }

    setProductSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getApiUrl('/admin/panel/products'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          original_price: newProduct.original_price ? parseFloat(newProduct.original_price) : null,
          stock_quantity: parseInt(newProduct.stock_quantity) || 0
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowProductModal(false);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          original_price: '',
          category_id: '',
          type: 'bouquet',
          size: 'medium',
          in_stock: true,
          stock_quantity: '',
          images: [],
          tags: []
        });
        fetchProducts();
        fetchStats();
        alert('Товар успешно добавлен!');
      } else {
        alert('Ошибка: ' + data.message);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при создании товара');
    } finally {
      setProductSubmitting(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'products') fetchProducts();
  }, [activeTab]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'В ожидании',
      'processing': 'В обработке',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-header">
        <div className="admin-panel-logo">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 16C16 10 20 6 26 6C26 12 22 16 16 16Z" fill="#C7A7E7" stroke="#8BC9A1" strokeWidth="2"/>
            <path d="M16 16C16 22 12 26 6 26C6 20 10 16 16 16Z" fill="#8BC9A1" stroke="#C7A7E7" strokeWidth="2"/>
            <path d="M16 16C10 16 6 12 6 6C12 6 16 10 16 16Z" fill="#A8D5BA" stroke="#8BC9A1" strokeWidth="2"/>
            <path d="M16 16C22 16 26 20 26 26C20 26 16 22 16 16Z" fill="#C7A7E7" stroke="#8BC9A1" strokeWidth="2"/>
            <circle cx="16" cy="16" r="4" fill="#F5ECD7" stroke="#8BC9A1" strokeWidth="2"/>
          </svg>
          <span>Floral Bliss Admin</span>
        </div>
        <div className="admin-panel-user">
          <span>{admin?.username || admin?.email}</span>
          <button onClick={handleLogout} className="admin-panel-logout-btn">Выйти</button>
        </div>
      </div>

      <div className="admin-panel-container">
        <div className="admin-panel-sidebar">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            Статистика
          </button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
            Заказы ({stats.pendingOrders})
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            Пользователи ({stats.users})
          </button>
          <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
            Товары ({stats.products})
          </button>
        </div>

        <div className="admin-panel-content">
          {activeTab === 'dashboard' && (
            <div>
              <h1>Статистика</h1>
              <div className="admin-panel-stats-grid">
                <div className="admin-panel-stat-card">
                  <div className="admin-panel-stat-info">
                    <h3>{stats.orders}</h3>
                    <p>Всего заказов</p>
                  </div>
                </div>
                <div className="admin-panel-stat-card">
                  <div className="admin-panel-stat-info">
                    <h3>{stats.pendingOrders}</h3>
                    <p>В ожидании</p>
                  </div>
                </div>
                <div className="admin-panel-stat-card">
                  <div className="admin-panel-stat-info">
                    <h3>{stats.users}</h3>
                    <p>Пользователей</p>
                  </div>
                </div>
                <div className="admin-panel-stat-card">
                  <div className="admin-panel-stat-info">
                    <h3>{stats.products}</h3>
                    <p>Товаров</p>
                  </div>
                </div>
                <div className="admin-panel-stat-card">
                  <div className="admin-panel-stat-info">
                    <h3>{stats.revenue.toLocaleString()} ₽</h3>
                    <p>Выручка</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h1>Управление заказами</h1>
              <div className="admin-panel-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Номер</th>
                      <th>Клиент</th>
                      <th>Сумма</th>
                      <th>Дата</th>
                      <th>Статус</th>
                      <th>Состав</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <React.Fragment key={order.id}>
                        <tr>
                          <td>{order.id}</td>
                          <td>{order.order_number}</td>
                          <td>{order.first_name || order.email || '-'}</td>
                          <td>{order.total?.toLocaleString()} ₽</td>
                          <td>{formatDate(order.created_at)}</td>
                          <td>
                            <span className={`admin-panel-status-badge ${order.status}`}>
                              {getStatusBadge(order.status)}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="admin-panel-view-btn"
                              onClick={() => toggleOrderExpand(order.id)}
                            >
                              {expandedOrder === order.id ? 'Скрыть' : 'Показать'}
                            </button>
                          </td>
                          <td>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="admin-panel-status-select"
                            >
                              <option value="pending">В ожидании</option>
                              <option value="processing">В обработке</option>
                              <option value="shipped">Отправлен</option>
                              <option value="delivered">Доставлен</option>
                              <option value="cancelled">Отменен</option>
                            </select>
                          </td>
                        </tr>
                        {expandedOrder === order.id && order.items && (
                          <tr className="order-expanded-row">
                            <td colSpan="8">
                              <div className="order-composition">
                                <h4>Состав заказа:</h4>
                                <div className="composition-items">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="composition-item">
                                      <div className="composition-item-header">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-quantity">× {item.quantity}</span>
                                        <span className="item-price">{item.price?.toLocaleString()} ₽</span>
                                      </div>
                                      {item.isCustom && item.customDetails && (
                                        <div className="custom-details">
                                          {item.customDetails.composition?.flowers?.length > 0 && (
                                            <div className="custom-flowers">
                                              <strong>Цветы:</strong>
                                              <div className="custom-flowers-list">
                                                {item.customDetails.composition.flowers.map((flower, fIdx) => (
                                                  <div key={fIdx} className="custom-flower-item">
                                                    <span className="flower-name">{flower.name}</span>
                                                    <span className="flower-color" style={{ backgroundColor: flower.hex }}></span>
                                                    <span className="flower-shade">{flower.shade || flower.color}</span>
                                                    <span className="flower-quantity">× {flower.quantity}</span>
                                                    <span className="flower-price">{flower.price?.toLocaleString()} ₽</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {item.customDetails.composition?.greenery?.length > 0 && (
                                            <div className="custom-greenery">
                                              <strong>Зелень:</strong>
                                              <div className="custom-greenery-list">
                                                {item.customDetails.composition.greenery.map((g, gIdx) => (
                                                  <div key={gIdx} className="custom-greenery-item">
                                                    <span>{g.name}</span>
                                                    <span>{g.price?.toLocaleString()} ₽</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {item.customDetails.composition?.packaging && (
                                            <div className="custom-packaging">
                                              <strong>Упаковка:</strong>
                                              <span>{item.customDetails.composition.packaging.name}</span>
                                              <span className="color-dot-small" style={{ backgroundColor: item.customDetails.composition.packaging.hex }}></span>
                                              <span>{item.customDetails.composition.packaging.shade || item.customDetails.composition.packaging.color}</span>
                                            </div>
                                          )}
                                          {item.customDetails.composition?.bow && (
                                            <div className="custom-bow">
                                              <strong>Бант:</strong>
                                              <span>{item.customDetails.composition.bow.name}</span>
                                              <span className="color-dot-small" style={{ backgroundColor: item.customDetails.composition.bow.hex }}></span>
                                              <span>{item.customDetails.composition.bow.shade}</span>
                                            </div>
                                          )}
                                          {item.customDetails.composition?.size && (
                                            <div className="custom-size">
                                              <strong>Размер:</strong>
                                              <span>{item.customDetails.composition.size}</span>
                                            </div>
                                          )}
                                          {item.customDetails.composition?.specialInstructions && (
                                            <div className="custom-instructions">
                                              <strong>Пожелания:</strong>
                                              <p>{item.customDetails.composition.specialInstructions}</p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="composition-total">
                                  <strong>Итого:</strong> {order.total?.toLocaleString()} ₽
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h1>Управление пользователями</h1>
              <div className="admin-panel-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Имя</th>
                      <th>Email</th>
                      <th>Телефон</th>
                      <th>Роль</th>
                      <th>Статус</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id_user}>
                        <td>{user.id_user}</td>
                        <td>{user.first_name} {user.last_name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone || '-'}</td>
                        <td>
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id_user, e.target.value)}
                            className="admin-panel-role-select"
                          >
                            <option value="user">Пользователь</option>
                            <option value="admin">Администратор</option>
                          </select>
                        </td>
                        <td>
                          <span className={`admin-panel-status-badge ${user.is_active ? 'active' : 'blocked'}`}>
                            {user.is_active ? 'Активен' : 'Заблокирован'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="admin-panel-toggle-btn"
                            onClick={() => toggleUserBlock(user.id_user)}
                          >
                            {user.is_active ? 'Заблокировать' : 'Разблокировать'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="admin-panel-header-actions">
                <h1>Управление товарами</h1>
                <button 
                  className="admin-panel-add-btn"
                  onClick={() => setShowProductModal(true)}
                >
                  + Добавить товар
                </button>
              </div>
              <div className="admin-panel-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Название</th>
                      <th>Цена</th>
                      <th>Тип</th>
                      <th>Наличие</th>
                      <th>Статус</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.name}</td>
                        <td>{product.price?.toLocaleString()} ₽</td>
                        <td>{product.type === 'bouquet' ? 'Букет' : product.type === 'plant' ? 'Растение' : 'Композиция'}</td>
                        <td>
                          <span className={`admin-panel-status-badge ${product.in_stock ? 'active' : 'inactive'}`}>
                            {product.in_stock ? 'В наличии' : 'Нет'}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-panel-status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                            {product.is_active ? 'Активен' : 'Скрыт'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="admin-panel-toggle-btn"
                            onClick={() => updateProductStatus(product.id, !product.in_stock, product.is_active)}
                          >
                            {product.in_stock ? 'Снять с продажи' : 'Вернуть в продажу'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showProductModal && (
        <div className="admin-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Добавление товара</h2>
              <button className="admin-modal-close" onClick={() => setShowProductModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>Название *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Введите название товара"
                />
              </div>
              
              <div className="admin-form-group">
                <label>Описание</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Введите описание товара"
                  rows="3"
                />
              </div>
              
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Цена *</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="Цена"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Цена со скидкой</label>
                  <input
                    type="number"
                    value={newProduct.original_price}
                    onChange={(e) => setNewProduct({...newProduct, original_price: e.target.value})}
                    placeholder="Старая цена"
                  />
                </div>
              </div>
              
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Тип</label>
                  <select value={newProduct.type} onChange={(e) => setNewProduct({...newProduct, type: e.target.value})}>
                    <option value="bouquet">Букет</option>
                    <option value="plant">Растение</option>
                    <option value="composition">Композиция</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Размер</label>
                  <select value={newProduct.size} onChange={(e) => setNewProduct({...newProduct, size: e.target.value})}>
                    <option value="small">Маленький</option>
                    <option value="medium">Средний</option>
                    <option value="large">Большой</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>В наличии</label>
                  <input
                    type="number"
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})}
                    placeholder="Количество"
                  />
                </div>
              </div>
              
              <div className="admin-form-group">
                <label>Теги (состав букета)</label>
                <div className="admin-tag-input">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Введите тег и нажмите Enter"
                  />
                  <button type="button" onClick={addTag}>+</button>
                </div>
                <div className="admin-tags-list">
                  {newProduct.tags.map((tag, idx) => (
                    <span key={idx} className="admin-tag">
                      {tag}
                      <button onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="admin-form-group">
                <label>Изображения (URL)</label>
                <div className="admin-image-input">
                  <input
                    type="text"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="URL изображения"
                  />
                  <button type="button" onClick={addImage}>+</button>
                </div>
                <div className="admin-images-list">
                  {newProduct.images.map((img, idx) => (
                    <div key={idx} className="admin-image-item">
                      <span>{img.substring(0, 50)}...</span>
                      <button onClick={() => removeImage(img)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-cancel" onClick={() => setShowProductModal(false)}>Отмена</button>
              <button className="admin-btn-submit" onClick={createProduct} disabled={productSubmitting}>
                {productSubmitting ? 'Добавление...' : 'Добавить товар'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}