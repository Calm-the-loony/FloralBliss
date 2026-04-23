import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import './ProductCard.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400&h=600&fit=crop&auto=format';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    id,
    name,
    price,
    original_price,
    images,
    description,
    category,
    in_stock,
    type
  } = product;

  const getFirstImage = () => {
    if (!images) return null;
    
    try {
      let imageArray = [];
      
      if (Array.isArray(images)) {
        imageArray = images;
      } 
      else if (typeof images === 'string') {
        try {
          const parsed = JSON.parse(images);
          if (Array.isArray(parsed)) {
            imageArray = parsed;
          } else {
            imageArray = [parsed];
          }
        } catch (e) {
          if (images.trim() !== '') {
            imageArray = [images];
          }
        }
      }
      
      return imageArray.find(img => img && img.trim() !== '') || null;
    } catch (error) {
      console.error('Ошибка парсинга изображений:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        setImageError(false);
        
        const firstImage = getFirstImage();
        
        if (!firstImage) {
          setImageUrl(FALLBACK_IMAGE);
          setImageLoaded(true);
          setLoading(false);
          return;
        }

        if (firstImage.includes('unsplash.com')) {
          setImageUrl(firstImage);
          setImageLoaded(true);
          setLoading(false);
          return;
        }
        
        if (firstImage.startsWith('http')) {
          const testImage = new Image();
          
          testImage.onload = () => {
            setImageUrl(firstImage);
            setImageLoaded(true);
            setLoading(false);
          };
          
          testImage.onerror = () => {
            setImageUrl(FALLBACK_IMAGE);
            setImageError(true);
            setLoading(false);
          };
          
          testImage.src = firstImage;
          return;
        }
        
        if (firstImage.startsWith('/')) {
          setImageUrl(firstImage);
          setImageLoaded(true);
          setLoading(false);
          return;
        }
        
        setImageUrl(FALLBACK_IMAGE);
        setImageLoaded(true);
        setLoading(false);
        
      } catch (error) {
        console.error('Ошибка загрузки изображения:', error);
        setImageUrl(FALLBACK_IMAGE);
        setImageError(true);
        setLoading(false);
      }
    };

    loadImage();
  }, [product, images, name]);

  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = FALLBACK_IMAGE;
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const isOnSale = original_price && Number(original_price) > Number(price);

  const normalizePrice = (priceValue) => {
    if (typeof priceValue === 'number') return priceValue;
    if (typeof priceValue === 'string') {
      const cleaned = priceValue.toString().replace(/\s/g, '').replace('₽', '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id,
      name,
      price: normalizePrice(price),
      image: imageUrl,
      description,
      category: category?.name || (typeof category === 'string' ? category : 'Товар'),
      type
    });

    const button = e.currentTarget;
    button.classList.add('added');
    setTimeout(() => button.classList.remove('added'), 1000);
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleFavorite(product);
    
    const heartBtn = e.currentTarget;
    heartBtn.classList.add('heart-animate');
    setTimeout(() => heartBtn.classList.remove('heart-animate'), 600);
  };

  const formatPrice = (priceValue) => {
    const normalized = normalizePrice(priceValue);
    return new Intl.NumberFormat('ru-RU').format(normalized) + ' ₽';
  };

  const getProductTypeText = () => {
    switch (type) {
      case 'plant': return 'растение';
      case 'composition': return 'композиция';
      default: return 'букет';
    }
  };

  return (
    <div className={`product-card ${!in_stock ? 'out-of-stock' : ''}`}>
      <div className="product-card__content-wrapper">
        <Link to={`/product/${id}`} className="product-card__image-link">
          <div className="product-card__image">
            <img 
              src={imageUrl}
              alt={name}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`product-image ${imageLoaded && !loading ? 'loaded' : 'loading'} ${imageError ? 'has-error' : ''}`}
            />
            
            {(loading || !imageLoaded) && !imageError && (
              <div className="image-loading">
                <div className="loading-spinner"></div>
                <span>Загрузка...</span>
              </div>
            )}
            
            <div className="product-card__badges">
              {!in_stock && (
                <span className="badge badge-out-of-stock">Нет в наличии</span>
              )}
              {isOnSale && (
                <span className="badge badge-sale">Скидка</span>
              )}
              {imageError && (
                <span className="badge badge-error">Фото</span>
              )}
              {type === 'plant' && (
                <span className="badge badge-plant">Растение</span>
              )}
            </div>

            <div className="product-card__actions">
              <button 
                className={`favorite-btn ${isFavorite(id) ? 'active' : ''}`}
                onClick={handleToggleFavorite}
                title={isFavorite(id) ? "Удалить из избранного" : "Добавить в избранное"}
                aria-label={isFavorite(id) ? "Удалить из избранного" : "Добавить в избранное"}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/>
                </svg>
              </button>
            </div>
          </div>
        </Link>

        <div className="product-card__content">
          <Link to={`/product/${id}`} className="product-card__text-link">
            <h3 className="product-card__name">{name}</h3>
            <p className="product-card__description">
              {description || `Красивый ${getProductTypeText()} для особого момента`}
            </p>
          </Link>

          <div className="product-card__footer">
            <div className="product-price">
              {isOnSale && original_price && (
                <span className="original-price">
                  {formatPrice(original_price)}
                </span>
              )}
              <span className="current-price">
                {formatPrice(price)}
              </span>
            </div>

            <button 
              className={`add-to-cart-btn ${!in_stock ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={!in_stock}
              data-product-id={id}
              aria-label={`Добавить ${name} в корзину`}
            >
              {!in_stock ? 'Нет в наличии' : 'В корзину'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;