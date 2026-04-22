import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './BouquetShowcase.css';

const BouquetShowcase = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Загружаем товары из БД...');
      
      const response = await fetch('http://localhost:5000/api/products/featured');
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📦 Ответ от сервера:', result);
      
      if (result.success && result.data && result.data.length > 0) {
        setProducts(result.data);
        console.log('✅ Данные загружены из БД:', result.data.length, 'товаров');
      } else {
        throw new Error('Нет данных в базе данных');
      }
      
    } catch (err) {
      console.error('❌ Ошибка загрузки товаров:', err);
      setError('Не удалось загрузить товары из базы данных. Пожалуйста, проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickView = (product) => {
    console.log('Быстрый просмотр:', product);
  };

  if (loading) {
    return (
      <section className="bouquet-showcase" id="bouquets">
        <div className="showcase__container">
          <div className="showcase__header">
            <h2 className="showcase__title">Популярные букеты</h2>
            <p className="showcase__subtitle">
              Самые востребованные композиции, которые точно понравятся
            </p>
          </div>

          <div className="showcase__grid loading">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="product-card skeleton">
                <div className="product-card__image skeleton-image"></div>
                <div className="product-card__content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text"></div>
                  <div className="product-card__footer">
                    <div className="skeleton-price"></div>
                    <div className="skeleton-button"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bouquet-showcase" id="bouquets">
      <div className="showcase__container">
        <div className="showcase__header">
          <h2 className="showcase__title">Популярные букеты</h2>
          <p className="showcase__subtitle">
            Самые востребованные композиции, которые точно понравятся
          </p>
        </div>

        {error && (
          <div className="warning-banner">
            <div className="warning-content">
              <span className="warning-icon">⚠️</span>
              <div className="warning-text">
                <strong>Информация:</strong> {error}
              </div>
              <button 
                className="retry-button small"
                onClick={fetchProducts}
              >
                Обновить
              </button>
            </div>
          </div>
        )}

        <div className="showcase__grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={handleQuickView}
            />
          ))}
        </div>

        {products.length === 0 && !loading && (
          <div className="no-products">
            <p>Товары временно недоступны. Попробуйте обновить страницу.</p>
          </div>
        )}

        <div className="showcase__cta">
          <div className="cta__content">
            <h3 className="cta__title">Не нашли подходящий вариант?</h3>
            <p className="cta__description">
              В нашем каталоге много готовых букетов и возможность создать уникальную композицию
            </p>
            <div className="cta__buttons">
              <a href="/bouquets" className="cta__button primary">Смотреть весь каталог</a>
              <a href="/custom-bouquet" className="cta__button secondary">Создать свой букет</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BouquetShowcase;