import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, calculateSubtotal, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  
  const [deliveryMethod, setDeliveryMethod] = useState('courier');
  const [paymentMethod, setPaymentMethod] = useState('cash_courier');
  const [formData, setFormData] = useState({
    address: '',
    apartment: '',
    entrance: '',
    floor: '',
    intercom: '',
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const subtotal = calculateSubtotal();
  const deliveryCost = deliveryMethod === 'courier' ? (subtotal >= 1500 ? 0 : 200) : 0;
  const total = subtotal + deliveryCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (deliveryMethod === 'courier' && !formData.address.trim()) {
      newErrors.address = 'Укажите адрес доставки';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Функция для форматирования элемента корзины в детальный вид
  const formatCartItem = (item) => {
    if (item.isCustom && item.customDetails) {
      // Для кастомного букета - показываем подробный состав
      const composition = item.customDetails.composition || {};
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        isCustom: true,
        customDetails: {
          composition: composition,
          flowers: composition.flowers || [],
          greenery: composition.greenery || [],
          packaging: composition.packaging,
          bow: composition.bow,
          size: composition.size,
          specialInstructions: composition.specialInstructions || item.customDetails.instructions || ''
        }
      };
    }
    // Для обычного товара
    return {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      isCustom: false
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert('Пожалуйста, войдите в аккаунт для оформления заказа');
      navigate('/login');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    // Форматируем каждый элемент корзины
    const formattedItems = cartItems.map(item => formatCartItem(item));

    const orderData = {
      items: formattedItems,
      subtotal: subtotal,
      delivery_method: deliveryMethod,
      delivery_cost: deliveryCost,
      total: total,
      address: formData.address,
      apartment: formData.apartment,
      entrance: formData.entrance,
      floor: formData.floor,
      intercom: formData.intercom,
      comment: formData.comment,
      payment_method: paymentMethod
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        clearCart();
        navigate('/order-success', { state: { orderNumber: data.orderNumber } });
      } else {
        alert('Ошибка при оформлении заказа: ' + data.message);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-cart">
            <h2>Корзина пуста</h2>
            <p>Добавьте товары из каталога, чтобы сделать заказ</p>
            <Link to="/bouquets" className="btn-primary">Перейти к покупкам</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Оформление заказа</h1>
          <p>Заполните форму и наш менеджер свяжется с вами для подтверждения</p>
        </div>
        
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Способ доставки</h2>
              <div className="delivery-methods">
                <label className={`delivery-option ${deliveryMethod === 'courier' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="courier"
                    checked={deliveryMethod === 'courier'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  />
                  <div className="option-content">
                    <strong>Курьерская доставка</strong>
                    <p>Бесплатно при заказе от 1500 ₽</p>
                  </div>
                </label>
                <label className={`delivery-option ${deliveryMethod === 'pickup' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  />
                  <div className="option-content">
                    <strong>Самовывоз</strong>
                    <p>г. Ростов-на-Дону, ул. Пушкинская, 150</p>
                  </div>
                </label>
              </div>
            </div>

            {deliveryMethod === 'courier' && (
              <div className="form-section">
                <h2>Адрес доставки</h2>
                <div className="form-group">
                  <label>Улица, дом *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={errors.address ? 'error' : ''}
                    placeholder="ул. Пушкинская, д. 150"
                  />
                  {errors.address && <span className="error-text">{errors.address}</span>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Квартира</label>
                    <input type="text" name="apartment" value={formData.apartment} onChange={handleInputChange} placeholder="Квартира" />
                  </div>
                  <div className="form-group">
                    <label>Подъезд</label>
                    <input type="text" name="entrance" value={formData.entrance} onChange={handleInputChange} placeholder="Подъезд" />
                  </div>
                  <div className="form-group">
                    <label>Этаж</label>
                    <input type="text" name="floor" value={formData.floor} onChange={handleInputChange} placeholder="Этаж" />
                  </div>
                  <div className="form-group">
                    <label>Домофон</label>
                    <input type="text" name="intercom" value={formData.intercom} onChange={handleInputChange} placeholder="Домофон" />
                  </div>
                </div>
              </div>
            )}

            <div className="form-section">
              <h2>Способ оплаты</h2>
              <div className="payment-methods">
                {deliveryMethod === 'courier' && (
                  <>
                    <label className={`payment-option ${paymentMethod === 'cash_courier' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_courier"
                        checked={paymentMethod === 'cash_courier'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="option-content">
                        <strong>Наличные курьеру</strong>
                        <p>Оплата при получении заказа</p>
                      </div>
                    </label>
                    <label className={`payment-option ${paymentMethod === 'card_courier' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card_courier"
                        checked={paymentMethod === 'card_courier'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="option-content">
                        <strong>Оплата картой курьеру</strong>
                        <p>Оплата при получении заказа</p>
                      </div>
                    </label>
                  </>
                )}
                
                {deliveryMethod === 'pickup' && (
                  <>
                    <label className={`payment-option ${paymentMethod === 'cash_pickup' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_pickup"
                        checked={paymentMethod === 'cash_pickup'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="option-content">
                        <strong>Наличные при самовывозе</strong>
                        <p>Оплата в точке выдачи</p>
                      </div>
                    </label>
                    <label className={`payment-option ${paymentMethod === 'card_pickup' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card_pickup"
                        checked={paymentMethod === 'card_pickup'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="option-content">
                        <strong>Оплата картой при самовывозе</strong>
                        <p>Оплата в точке выдачи</p>
                      </div>
                    </label>
                  </>
                )}
                
                <label className={`payment-option ${paymentMethod === 'transfer' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="option-content">
                    <strong>Перевод на карту</strong>
                    <p>Реквизиты будут отправлены после оформления заказа</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h2>Комментарий к заказу</h2>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                placeholder="Пожелания к букету, удобное время доставки..."
                rows="4"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Оформление...' : `Оформить заказ на ${total.toLocaleString()} ₽`}
            </button>
          </form>

          <div className="order-summary">
            <h2>Ваш заказ</h2>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">×{item.quantity}</span>
                  </div>
                  <span className="item-price">{(item.price * item.quantity).toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Товары</span>
                <span>{subtotal.toLocaleString()} ₽</span>
              </div>
              <div className="summary-row">
                <span>Доставка</span>
                <span>{deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost.toLocaleString()} ₽`}</span>
              </div>
              <div className="summary-row total">
                <span>Итого</span>
                <span className="total-amount">{total.toLocaleString()} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}