import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { getApiUrl } from '../../config';
import './Plants.css';

const priceRanges = [
  { id: 'all', name: 'Любая цена', min: 0, max: Infinity },
  { id: 'budget', name: 'До 1 500 ₽', min: 0, max: 1500 },
  { id: 'medium', name: '1 500 - 3 000 ₽', min: 1500, max: 3000 },
  { id: 'premium', name: 'От 3 000 ₽', min: 3000, max: Infinity }
];

const careLevels = [
  { id: 'all', name: 'Любой уход' },
  { id: 'easy', name: 'Легкий' },
  { id: 'medium', name: 'Средний' },
  { id: 'hard', name: 'Сложный' }
];

const sortOptions = [
  { id: 'default', name: 'По умолчанию' },
  { id: 'price-asc', name: 'Сначала дешевле' },
  { id: 'price-desc', name: 'Сначала дороже' },
  { id: 'name', name: 'По названию' },
  { id: 'height', name: 'По высоте' }
];

const ITEMS_PER_PAGE = 12;
const PAGINATION_VISIBLE_PAGES = 5;

export default function Plants() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedCare, setSelectedCare] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPrice, selectedCare, searchQuery, sortBy]);

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
    const fetchPlants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(getApiUrl('/products/plants'));
        
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          console.log('🌿 Данные растений получены:', result.data);
          setProducts(result.data);
        } else {
          throw new Error(result.message || 'Ошибка при загрузке растений');
        }
      } catch (error) {
        console.error('Ошибка загрузки растений:', error);
        setError(error.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

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

  const getCareLevel = (careInstructions) => {
    if (!careInstructions) return 'medium';
    const text = careInstructions.toLowerCase();
    if (text.includes('редкий') || text.includes('1 раз в 2 недели') || text.includes('неприхотлив')) {
      return 'easy';
    }
    if (text.includes('капризн') || text.includes('сложн') || text.includes('требовател')) {
      return 'hard';
    }
    return 'medium';
  };

  useEffect(() => {
    if (!products.length) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    if (selectedPrice !== 'all') {
      const priceRange = priceRanges.find(range => range.id === selectedPrice);
      filtered = filtered.filter(plant => {
        const productPrice = typeof plant.price === 'number' ? plant.price : 
                            parseFloat(plant.price) || 0;
        return productPrice >= priceRange.min && productPrice <= priceRange.max;
      });
    }

    if (selectedCare !== 'all') {
      filtered = filtered.filter(plant => {
        const careLevel = getCareLevel(plant.care_instructions);
        return careLevel === selectedCare;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plant => {
        const tags = parseTags(plant.tags);
        return plant.name?.toLowerCase().includes(query) ||
               plant.description?.toLowerCase().includes(query) ||
               tags.some(tag => tag.toLowerCase().includes(query));
      });
    }

    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
          const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
          const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0;
          return priceB - priceA;
        });
        break;
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'height':
        filtered.sort((a, b) => (a.height_cm || 0) - (b.height_cm || 0));
        break;
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedPrice, selectedCare, searchQuery, sortBy]);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / itemsPerPage);
  }, [filteredProducts, itemsPerPage]);

  const goToPage = useCallback((page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const getPageNumbers = useMemo(() => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(PAGINATION_VISIBLE_PAGES / 2));
    let endPage = Math.min(totalPages, startPage + PAGINATION_VISIBLE_PAGES - 1);
    
    if (endPage - startPage + 1 < PAGINATION_VISIBLE_PAGES) {
      startPage = Math.max(1, endPage - PAGINATION_VISIBLE_PAGES + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  const clearFilters = useCallback(() => {
    setSelectedPrice('all');
    setSelectedCare('all');
    setSearchQuery('');
    setSortBy('default');
    setIsSearching(false);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  }, [searchTimeout]);

  const handleQuickView = (plant) => {
    console.log('Быстрый просмотр растения:', plant);
    alert(`Быстрый просмотр: ${plant.name}\nЦена: ${plant.price} ₽`);
  };

  const getDisplayedProductsCount = () => {
    if (loading) return 'Загрузка...';
    if (error) return `Ошибка: ${error}`;
    return `Найдено ${filteredProducts.length} растений`;
  };

  const getActiveFiltersCount = () => {
    return [
      selectedPrice !== 'all',
      selectedCare !== 'all',
      !!searchQuery,
      sortBy !== 'default'
    ].filter(Boolean).length;
  };

  const getItemsRange = () => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filteredProducts.length);
    return `${start}-${end} из ${filteredProducts.length}`;
  };

  return (
    <div className="plants-page">
      <div className="container">
        <section className="bouquets-hero">
          <div className="bouquets-hero-content">
            <div className="hero-decoration">
              <div className="flower-decoration">🌿</div>
              <h1>Комнатные растения</h1>
              <div className="flower-decoration">🌱</div>
            </div>
            <p>Создайте уют в вашем доме с нашими зелеными друзьями</p>
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
                placeholder="Поиск растений по названию или описанию..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="search-input"
                aria-label="Поиск растений"
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
              {isSearching && (
                <div className="search-spinner"></div>
              )}
            </div>
          </div>
        </section>

        <section className="bouquets-filters">
          <div className="filters-grid">
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
                <label className="filter-label">Сложность ухода</label>
                <div className="sort-options">
                  {careLevels.map(level => (
                    <button
                      key={level.id}
                      className={`sort-option ${selectedCare === level.id ? 'active' : ''}`}
                      onClick={() => setSelectedCare(level.id)}
                      aria-pressed={selectedCare === level.id}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">Сортировка</label>
                <div className="sort-options">
                  {sortOptions.map(option => (
                    <button
                      key={option.id}
                      className={`sort-option ${sortBy === option.id ? 'active' : ''}`}
                      onClick={() => setSortBy(option.id)}
                      aria-pressed={sortBy === option.id}
                    >
                      {option.name}
                    </button>
                  ))}
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

        <section className="bouquets-grid-section">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Загружаем растения...</p>
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
              <div className="no-results-icon">🌵</div>
              <h3>Растения не найдены</h3>
              <p>Попробуйте изменить параметры поиска или сбросить фильтры</p>
              <button 
                className="cta-button primary"
                onClick={clearFilters}
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {currentProducts.map((plant, index) => (
                  <ProductCard
                    key={plant.id}
                    product={plant}
                    index={index}
                    onQuickView={handleQuickView}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Показано {getItemsRange()}
                  </div>
                  <div className="pagination">
                    <button
                      className="pagination-arrow"
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      aria-label="Предыдущая страница"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {getPageNumbers[0] > 1 && (
                      <>
                        <button
                          className="pagination-number"
                          onClick={() => goToPage(1)}
                        >
                          1
                        </button>
                        {getPageNumbers[0] > 2 && (
                          <span className="pagination-dots">...</span>
                        )}
                      </>
                    )}

                    {getPageNumbers.map(page => (
                      <button
                        key={page}
                        className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => goToPage(page)}
                        aria-label={`Страница ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}

                    {getPageNumbers[getPageNumbers.length - 1] < totalPages && (
                      <>
                        {getPageNumbers[getPageNumbers.length - 1] < totalPages - 1 && (
                          <span className="pagination-dots">...</span>
                        )}
                        <button
                          className="pagination-number"
                          onClick={() => goToPage(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      className="pagination-arrow"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      aria-label="Следующая страница"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}