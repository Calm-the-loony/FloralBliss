import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import './Favorites.css';

export default function Favorites() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const { addToCart } = useCart();
  const getCategoryName = (category) => {
    if (!category) return 'Букет';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.name) return category.name;
    return 'Букет';
  };

  const getImage = (item) => {
    if (item.image) return item.image;
    if (item.images && Array.isArray(item.images)) return item.images[0];
    if (item.images && typeof item.images === 'string') {
      try {
        const parsed = JSON.parse(item.images);
        return Array.isArray(parsed) && parsed[0] ? parsed[0] : '/images/placeholder-flower.jpg';
      } catch (e) {
        return item.images;
      }
    }
    return '/images/placeholder-flower.jpg';
  };

  // Функция для безопасного получения цены
  const getPrice = (item) => {
    if (typeof item.price === 'number') return item.price;
    if (typeof item.price === 'string') {
      const cleaned = item.price.toString().replace(/\s/g, '').replace('₽', '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };

  const handleAddToCart = (product) => {
    const price = getPrice(product);
    
    addToCart({
      id: product.id,
      name: product.name,
      price: price,
      image: getImage(product),
      description: product.description || 'Описание товара',
      category: getCategoryName(product.category)
    });
  };

  const handleRemoveFromFavorites = (id, e) => {
    e.stopPropagation();
    removeFromFavorites(id);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  if (favorites.length === 0) {
    return (
      <div className="favorites-page">
        <div className="container">
          <div className="empty-favorites">
            <div className="empty-favorites-icon">💝</div>
            <h1>В избранном пока пусто</h1>
            <p>Добавляйте понравившиеся букеты, чтобы не потерять их</p>
            <Link to="/" className="cta-button primary">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="container">
        <div className="favorites-header">
          <h1>Избранное</h1>
          <p>Ваши любимые букеты ({favorites.length})</p>
          <button 
            className="clear-favorites-btn"
            onClick={clearFavorites}
          >
            Очистить избранное
          </button>
        </div>

        <div className="favorites-grid">
          {favorites.map(item => (
            <div key={item.id} className="favorite-card">
              <div className="favorite-image">
                <img src={getImage(item)} alt={item.name} />
                <button 
                  className="remove-favorite-btn"
                  onClick={(e) => handleRemoveFromFavorites(item.id, e)}
                  title="Удалить из избранного"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
                <div className="favorite-badge">
                  {getCategoryName(item.category)}
                </div>
              </div>
              
              <div className="favorite-info">
                <h3 className="favorite-name">{item.name}</h3>
                <p className="favorite-description">
                  {item.description || 'Красивый букет для особого момента'}
                </p>
                <div className="favorite-footer">
                  <span className="favorite-price">
                    {formatPrice(getPrice(item))}
                  </span>
                  <button 
                    className="favorite-add-to-cart"
                    onClick={() => handleAddToCart(item)}
                  >
                    <span>В корзину</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M8 4V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="favorites-actions">
          <Link to="/" className="back-to-catalog">
            ← Продолжить покупки
          </Link>
        </div>
      </div>
    </div>
  );
}