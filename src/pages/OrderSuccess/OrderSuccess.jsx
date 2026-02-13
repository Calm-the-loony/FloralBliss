import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './OrderSuccess.css';

export default function OrderSuccess() {
  const location = useLocation();
  const { orderNumber } = location.state || {};

  return (
    <div className="order-success-page">
      <div className="container">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h1>Заказ успешно оформлен!</h1>
          <p>Номер вашего заказа: <strong>{orderNumber}</strong></p>
          <p>Статус заказа можно отслеживать в личном кабинете в разделе "Мои заказы"</p>
          <div className="success-buttons">
            <Link to="/profile" className="btn-primary">Перейти в профиль</Link>
            <Link to="/bouquets" className="btn-secondary">Продолжить покупки</Link>
          </div>
        </div>
      </div>
    </div>
  );
}