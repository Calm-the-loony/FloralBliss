import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import './ProductPage.css';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Получение всех изображений из JSON
  const getImageArray = (images) => {
    if (!images) return [];
    
    try {
      if (Array.isArray(images)) {
        return images;
      } 
      else if (typeof images === 'string') {
        try {
          const parsed = JSON.parse(images);
          if (Array.isArray(parsed)) {
            return parsed;
          } else {
            return [parsed];
          }
        } catch (e) {
          if (images.trim() !== '') {
            return [images];
          }
        }
      }
      return [];
    } catch (error) {
      console.error('Ошибка парсинга изображений:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        
        console.log('🔍 Запрос товара с id:', id);
        console.log('📡 Ответ сервера статус:', response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log('🔄 API не нашел товар, пробуем найти в общем списке...');
            const allResponse = await fetch('http://localhost:5000/api/products/all');
            
            if (allResponse.ok) {
              const allResult = await allResponse.json();
              if (allResult.success) {
                const foundProduct = allResult.data.find(p => String(p.id) === String(id));
                if (foundProduct) {
                  setProduct(foundProduct);
                  const images = getImageArray(foundProduct.images);
                  setSelectedImage(images[0] || '');
                  setLoading(false);
                  return;
                }
              }
            }
            throw new Error(`Товар с id=${id} не найден в базе данных`);
          }
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📦 Получен товар:', result);
        
        if (result.success && result.data) {
          setProduct(result.data);
          const images = getImageArray(result.data.images);
          setSelectedImage(images[0] || '');
        } else {
          throw new Error(result.message || 'Товар не найден');
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки товара:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const normalizePrice = (priceValue) => {
    if (typeof priceValue === 'number') return priceValue;
    if (typeof priceValue === 'string') {
      const cleaned = priceValue.toString().replace(/\s/g, '').replace('₽', '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const formatPrice = (priceValue) => {
    const normalized = normalizePrice(priceValue);
    return new Intl.NumberFormat('ru-RU').format(normalized) + ' ₽';
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Добавляем товар с учетом выбранного количества
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: normalizePrice(product.price),
        image: selectedImage,
        description: product.description,
        category: product.category?.name,
        type: product.type,
        quantity: 1
      });
    }
    
    // Анимация кнопки
    const button = document.querySelector('.add-to-cart-page');
    if (button) {
      button.classList.add('added');
      setTimeout(() => button.classList.remove('added'), 1000);
    }
    
    // Сброс количества после добавления (опционально)
    // setQuantity(1);
  };

  const handleToggleFavorite = () => {
    if (product) {
      toggleFavorite(product);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 99)) {
      setQuantity(newQuantity);
    }
  };

  const isOnSale = product?.original_price && product.original_price > product.price;
  const discountPercent = isOnSale 
    ? Math.round((1 - product.price / product.original_price) * 100) 
    : 0;
  const isProductFavorite = product ? isFavorite(product.id) : false;
  const images = product ? getImageArray(product.images) : [];

  // Функция для парсинга тегов
  const parseTags = (tags) => {
    if (!tags) return [];
    try {
      if (Array.isArray(tags)) return tags;
      if (typeof tags === 'string') {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="product-page loading-page">
        <div className="container">
          <div className="loading-spinner"></div>
          <p>Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-page error-page">
        <div className="container">
          <div className="error-container">
            <h2>Товар не найден</h2>
            <p>{error || 'Извините, такой букет отсутствует в нашем каталоге'}</p>
            <button 
              className="cta-button primary"
              onClick={() => navigate('/bouquets')}
            >
              Вернуться в каталог
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="container">
        {/* Хлебные крошки */}
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span className="separator">/</span>
          <Link to="/bouquets">Каталог букетов</Link>
          <span className="separator">/</span>
          <span className="current">{product.name}</span>
        </div>

        <div className="product-page-grid">
          {/* Левая колонка - изображения */}
          <div className="product-gallery">
            <div className="main-image">
              {selectedImage ? (
                <img 
                  src={selectedImage}
                  alt={product.name}
                  onLoad={() => setImageLoaded(true)}
                  className={imageLoaded ? 'loaded' : 'loading'}
                />
              ) : (
                <div className="no-image">Нет изображения</div>
              )}
              {(isOnSale || !product.in_stock) && (
                <div className="image-badges">
                  {!product.in_stock && (
                    <span className="badge badge-out-of-stock">Нет в наличии</span>
                  )}
                  {isOnSale && (
                    <span className="badge badge-sale">-{discountPercent}%</span>
                  )}
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedImage(img);
                      setImageLoaded(false);
                    }}
                  >
                    <img src={img} alt={`${product.name} - фото ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Правая колонка - информация */}
          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              
              <button 
                className={`favorite-btn-page ${isProductFavorite ? 'active' : ''}`}
                onClick={handleToggleFavorite}
                aria-label={isProductFavorite ? "Удалить из избранного" : "Добавить в избранное"}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/>
                </svg>
                <span>{isProductFavorite ? 'В избранном' : 'В избранное'}</span>
              </button>
            </div>

            <div className="product-category">
              <span className="category-label">Категория:</span>
              <span className="category-value">{product.category?.name || 'Букет'}</span>
            </div>

            <div className="product-price-block">
              {isOnSale && (
                <span className="original-price-page">
                  {formatPrice(product.original_price)}
                </span>
              )}
              <span className="current-price-page">
                {formatPrice(product.price)}
              </span>
            </div>

            <div className="product-description">
              <h3>Описание</h3>
              <p className="full-description">{product.description || `Красивый букет из свежих цветов. Идеально подходит для особого момента.`}</p>
            </div>

            {product.tags && (
              <div className="product-tags">
                <h3>Состав букета</h3>
                <div className="tags-list">
                  {parseTags(product.tags).map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {product.care_instructions && (
              <div className="product-care">
                <h3>Уход за букетом</h3>
                <p>{product.care_instructions}</p>
              </div>
            )}

            <div className="product-specs">
              {product.height_cm && (
                <div className="spec-item">
                  <span className="spec-label">Высота:</span>
                  <span className="spec-value">{product.height_cm} см</span>
                </div>
              )}
              {product.weight_grams && (
                <div className="spec-item">
                  <span className="spec-label">Вес:</span>
                  <span className="spec-value">{product.weight_grams} г</span>
                </div>
              )}
              <div className="spec-item">
                <span className="spec-label">Наличие:</span>
                <span className={`stock-status ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}>
                  {product.in_stock ? 'В наличии' : 'Нет в наличии'}
                </span>
              </div>
            </div>

            <div className="product-actions">
              {product.in_stock && (
                <div className="quantity-selector">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock_quantity}
                  >
                    +
                  </button>
                </div>
              )}
              
              <button 
                className={`add-to-cart-page ${!product.in_stock ? 'disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={!product.in_stock}
              >
                {!product.in_stock ? 'Нет в наличии' : 'Добавить в корзину'}
              </button>
            </div>

            <div className="delivery-info">
              <div className="delivery-item">
                <div>
                  <strong>Бесплатная доставка</strong>
                  <p>При заказе от 3000 ₽ по городу</p>
                </div>
              </div>
              <div className="delivery-item">
                <div>
                  <strong>Свежесть гарантируем</strong>
                  <p>Цветы срезаны не более 24 часов назад</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;