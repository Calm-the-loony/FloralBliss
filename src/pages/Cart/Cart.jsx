import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, calculateSubtotal, clearCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState('courier');

  const calculateDelivery = () => {
    if (deliveryMethod === 'pickup') return 0;
    const subtotal = calculateSubtotal();
    return subtotal >= 1500 ? 0 : 200;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDelivery();
  };

  const handleCheckout = () => {
    alert('Заказ оформлен!');
    clearCart();
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h1>Корзина пуста</h1>
            <p>Добавьте товары из каталога, чтобы сделать заказ</p>
            <Link to="/" className="cta-button primary">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Корзина</h1>
          <p>Проверьте состав заказа перед оформлением</p>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            <div className="items-header">
              <span>Товар</span>
              <span>Количество</span>
              <span>Стоимость</span>
            </div>

            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-price-mobile">
                    {item.price.toLocaleString()} ₽ × {item.quantity} = {(item.price * item.quantity).toLocaleString()} ₽
                  </div>
                  <button 
                    className="remove-button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Удалить
                  </button>
                </div>

                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  <div className="total-price">{(item.price * item.quantity).toLocaleString()} ₽</div>
                  <div className="unit-price">{item.price.toLocaleString()} ₽/шт</div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Итоги заказа</h3>
              
              <div className="summary-row">
                <span>Товары ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} шт)</span>
                <span>{calculateSubtotal().toLocaleString()} ₽</span>
              </div>

              <div className="summary-row">
                <span>Доставка</span>
                <span>
                  {calculateDelivery() === 0 ? 'Бесплатно' : `${calculateDelivery().toLocaleString()} ₽`}
                </span>
              </div>

              <div className="delivery-options">
                <h4>Способ доставки</h4>
                <div className="delivery-methods">
                  <label className="delivery-option">
                    <input
                      type="radio"
                      name="delivery"
                      value="courier"
                      checked={deliveryMethod === 'courier'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                    />
                    <span className="checkmark"></span>
                    <div className="option-info">
                      <span className="option-title">Курьерская доставка</span>
                      <span className="option-description">Бесплатно от 1500 ₽</span>
                    </div>
                  </label>
                  
                  <label className="delivery-option">
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={deliveryMethod === 'pickup'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                    />
                    <span className="checkmark"></span>
                    <div className="option-info">
                      <span className="option-title">Самовывоз</span>
                      <span className="option-description">г. Ростов-на-Дону, ул. Пушкинская, 150</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="summary-total">
                <div className="total-row">
                  <span>Итого</span>
                  <span className="total-price">{calculateTotal().toLocaleString()} ₽</span>
                </div>
              </div>

              <button 
                className="checkout-button"
                onClick={handleCheckout}
              >
                Перейти к оформлению
              </button>

              <div className="security-notice">
                <div className="security-icon">🔒</div>
                <p>Ваши данные защищены. Мы не передаем информацию третьим лицам.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}