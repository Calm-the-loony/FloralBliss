import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../../components/ProductCard/ProductCard';
import { getApiUrl } from '../../config';
import './Compositions.css';

const categories = [
  { id: 'all', name: 'Все композиции', dbField: null },
  { id: 'seasonal', name: 'Сезонные', dbField: 'seasonal' },
  { id: 'wedding', name: 'Свадебные', dbField: 'wedding' },
  { id: 'modern', name: 'Современные', dbField: 'modern' },
  { id: 'romantic', name: 'Романтические', dbField: 'romantic' },
  { id: 'exotic', name: 'Экзотические', dbField: 'exotic' },
  { id: 'minimalist', name: 'Минимализм', dbField: 'minimalist' },
  { id: 'thematic', name: 'Тематические', dbField: 'thematic' },
  { id: 'celebration', name: 'Праздничные', dbField: 'celebration' }
];

const priceRanges = [
  { id: 'all', name: 'Любая цена', min: 0, max: Infinity },
  { id: 'budget', name: 'До 4 000 ₽', min: 0, max: 4000 },
  { id: 'medium', name: '4 000 - 6 000 ₽', min: 4000, max: 6000 },
  { id: 'premium', name: 'От 6 000 ₽', min: 6000, max: Infinity }
];

const sortOptions = [
  { id: 'default', name: 'По умолчанию' },
  { id: 'price-asc', name: 'Сначала дешевле' },
  { id: 'price-desc', name: 'Сначала дороже' },
  { id: 'name', name: 'По названию' }
];

export default function Compositions() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setIsSearching(true);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setIsSearching(false);
    }, 500);
    
    setSearchTimeout(timeout);
  }, [searchTimeout]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  }, [searchTimeout]);

  useEffect(() => {
    const fetchCompositions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(getApiUrl('/products/compositions'));
        
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          const compositions = result.data.map(product => ({
            ...product,
            isComposition: true,
            typeLabel: 'Композиция'
          }));
          
          setProducts(compositions);
        } else {
          throw new Error(result.message || 'Ошибка при загрузке композиций');
        }
      } catch (error) {
        setError(error.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompositions();
  }, []);

  useEffect(() => {
    if (!products.length) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    if (selectedCategory !== 'all') {
      const selectedCat = categories.find(cat => cat.id === selectedCategory);
      if (selectedCat?.dbField) {
        filtered = filtered.filter(product => {
          const categoryName = product.category?.name?.toLowerCase();
          return (
            product.category?.slug === selectedCat.id ||
            categoryName === selectedCat.dbField ||
            (selectedCat.dbField === 'exotic' && categoryName?.includes('экзотич')) ||
            (selectedCat.dbField === 'minimalist' && categoryName?.includes('минимал'))
          );
        });
      }
    }

    if (selectedPrice !== 'all') {
      const priceRange = priceRanges.find(range => range.id === selectedPrice);
      filtered = filtered.filter(product => {
        const productPrice = typeof product.price === 'number' ? product.price : 
                            parseFloat(product.price) || 0;
        return productPrice >= priceRange.min && productPrice <= priceRange.max;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.name?.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        break;
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedPrice, searchQuery, sortBy]);

  const clearFilters = useCallback(() => {
    setSelectedCategory('all');
    setSelectedPrice('all');
    setSearchQuery('');
    setSortBy('default');
    setIsSearching(false);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  }, [searchTimeout]);

  const handleQuickView = (product) => {
    alert(`Быстрый просмотр: ${product.name}\nЦена: ${product.price} ₽\nТип: Композиция`);
  };

  const getDisplayedProductsCount = () => {
    if (loading) return 'Загрузка...';
    if (error) return `Ошибка: ${error}`;
    return `Найдено ${filteredProducts.length} композиций`;
  };

  const getActiveFiltersCount = () => {
    return [
      selectedCategory !== 'all',
      selectedPrice !== 'all',
      !!searchQuery,
      sortBy !== 'default'
    ].filter(Boolean).length;
  };

  return (
    <div className="compositions-page">
      <div className="container">
        <section className="compositions-hero">
          <div className="compositions-hero-content">
            <div className="hero-decoration">
              <div className="flower-decoration">🌸</div>
              <h1>Каталог композиций</h1>
              <div className="flower-decoration">💐</div>
            </div>
            <p>Уникальные флористические работы для украшения интерьера и особых моментов</p>
          </div>
          <div className="hero-wave">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
            </svg>
          </div>
        </section>

        <section className="search-section">
          <div className="search-container">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Поиск композиций по названию или описанию..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="search-input"
                aria-label="Поиск композиций"
              />
              {searchQuery && (
                <button 
                  className="search-clear-btn"
                  onClick={handleClearSearch}
                  aria-label="Очистить поиск"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {isSearching && <div className="search-spinner"></div>}
            </div>
          </div>
        </section>

        <section className="compositions-filters">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Категория</label>
              <div className="category-filters">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`category-filter ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                    aria-pressed={selectedCategory === category.id}
                  >
                    <span className="category-name">{category.name}</span>
                    <span className="category-dot"></span>
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group price-group">
                <label className="filter-label">Ценовой диапазон</label>
                <div className="price-options">
                  {priceRanges.map(range => (
                    <button
                      key={range.id}
                      className={`price-option ${selectedPrice === range.id ? 'active' : ''}`}
                      onClick={() => setSelectedPrice(range.id)}
                      aria-pressed={selectedPrice === range.id}
                    >
                      {range.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">Сортировка</label>
                <div className="sort-options">
                  <button 
                    className={`sort-option ${sortBy === 'default' ? 'active' : ''}`}
                    onClick={() => setSortBy('default')}
                    aria-pressed={sortBy === 'default'}
                  >
                    По умолчанию
                  </button>
                  <button 
                    className={`sort-option ${sortBy === 'price-asc' ? 'active' : ''}`}
                    onClick={() => setSortBy('price-asc')}
                    aria-pressed={sortBy === 'price-asc'}
                  >
                    По цене ↑
                  </button>
                  <button 
                    className={`sort-option ${sortBy === 'price-desc' ? 'active' : ''}`}
                    onClick={() => setSortBy('price-desc')}
                    aria-pressed={sortBy === 'price-desc'}
                  >
                    По цене ↓
                  </button>
                  <button 
                    className={`sort-option ${sortBy === 'name' ? 'active' : ''}`}
                    onClick={() => setSortBy('name')}
                    aria-pressed={sortBy === 'name'}
                  >
                    По названию
                  </button>
                </div>
              </div>

              <button 
                className="clear-filters-btn"
                onClick={clearFilters}
                disabled={getActiveFiltersCount() === 0}
              >
                <span className="clear-icon">↻</span>
                Сбросить все
              </button>
            </div>
          </div>

          <div className="filter-results">
            <div className="results-info">
              <p className="results-count">
                {getDisplayedProductsCount()}
                {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
                  <span className="no-match"> (ничего не соответствует фильтрам)</span>
                )}
              </p>
              {searchQuery && (
                <p className="search-query">
                  По запросу: "<strong>{searchQuery}</strong>"
                </p>
              )}
            </div>
            {getActiveFiltersCount() > 0 && (
              <button 
                className="clear-filters-mobile"
                onClick={clearFilters}
              >
                × Сбросить фильтры
              </button>
            )}
          </div>
        </section>

        <section className="compositions-grid-section">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Загружаем композиции...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">❌</div>
              <h3>Ошибка загрузки</h3>
              <p>{error}</p>
              <button 
                className="cta-button primary"
                onClick={() => window.location.reload()}
              >
                Попробовать снова
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🌺</div>
              <h3>Композиции не найдены</h3>
              <p>Попробуйте изменить параметры поиска или сбросить фильтры</p>
              <button 
                className="cta-button primary"
                onClick={clearFilters}
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    typeLabel: 'Композиция',
                    badgeType: 'composition'
                  }}
                  onQuickView={handleQuickView}
                  showTypeBadge={true}
                />
              ))}
            </div>
          )}
        </section>

        <section className="custom-composition-section">
          <div className="custom-composition-content">
            <h2>Хотите уникальную композицию?</h2>
            <p>Наши флористы создадут эксклюзивную работу специально для вас</p>
            <div className="custom-composition-buttons">
              <a href="/custom-composition" className="custom-composition-btn primary">
                Заказать индивидуальный дизайн
              </a>
              <a href="/delivery" className="custom-composition-btn secondary">
                Узнать о доставке
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}