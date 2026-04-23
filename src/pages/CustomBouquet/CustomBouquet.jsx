import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getApiUrl } from '../../config';
import './CustomBouquet.css';

export default function CustomBouquet() {
  const { addToCart } = useCart();
  
  const [flowerOptions, setFlowerOptions] = useState([]);
  const [greeneryOptions, setGreeneryOptions] = useState([]);
  const [packagingOptions, setPackagingOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedFlowers, setSelectedFlowers] = useState([]);
  const [selectedGreenery, setSelectedGreenery] = useState([]);
  const [selectedPackaging, setSelectedPackaging] = useState(null);
  const [selectedBow, setSelectedBow] = useState(null);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [bouquetName, setBouquetName] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Цветовая палитра
  const colorPalette = {
    flowers: {
      red: [
        { id: 'red-1', name: 'Алый', shade: 'Ярко-красный', hex: '#FF4D4D' },
        { id: 'red-2', name: 'Бургунди', shade: 'Благородный винный', hex: '#8B1E3F' },
        { id: 'red-3', name: 'Коралловый', shade: 'Нежный коралл', hex: '#FF7F7F' },
        { id: 'red-4', name: 'Рубиновый', shade: 'Глубокий красный', hex: '#B22222' }
      ],
      pink: [
        { id: 'pink-1', name: 'Нежно-розовый', shade: 'Пастельная роза', hex: '#FFB7C5' },
        { id: 'pink-2', name: 'Пудровый', shade: 'Мятная роза', hex: '#F5D1D1' },
        { id: 'pink-3', name: 'Фламинго', shade: 'Ярко-розовый', hex: '#FC8EAC' },
        { id: 'pink-4', name: 'Фуксия', shade: 'Насыщенный розовый', hex: '#D9017A' }
      ],
      white: [
        { id: 'white-1', name: 'Белоснежный', shade: 'Чисто-белый', hex: '#FFFFFF' },
        { id: 'white-2', name: 'Слоновая кость', shade: 'Теплый белый', hex: '#FDF5E6' },
        { id: 'white-3', name: 'Шампань', shade: 'Золотистый бежевый', hex: '#F7E7CE' },
        { id: 'white-4', name: 'Жемчужный', shade: 'Перламутровый', hex: '#F0F0F4' }
      ],
      yellow: [
        { id: 'yellow-1', name: 'Лимонный', shade: 'Свежий желтый', hex: '#FCE883' },
        { id: 'yellow-2', name: 'Медовый', shade: 'Теплый желтый', hex: '#FFC72C' },
        { id: 'yellow-3', name: 'Шафрановый', shade: 'Золотистый', hex: '#F4C542' },
        { id: 'yellow-4', name: 'Солнечный', shade: 'Ярко-желтый', hex: '#FFD700' }
      ],
      orange: [
        { id: 'orange-1', name: 'Персиковый', shade: 'Нежный персик', hex: '#FFDAB9' },
        { id: 'orange-2', name: 'Мандариновый', shade: 'Сочный оранжевый', hex: '#FFA07A' },
        { id: 'orange-3', name: 'Тыквенный', shade: 'Теплый оранжевый', hex: '#FF8C42' },
        { id: 'orange-4', name: 'Коралловый', shade: 'Розово-оранжевый', hex: '#FF7F50' }
      ],
      purple: [
        { id: 'purple-1', name: 'Лавандовый', shade: 'Нежный фиолетовый', hex: '#E6E6FA' },
        { id: 'purple-2', name: 'Сиреневый', shade: 'Мягкий фиолетовый', hex: '#C8A2C8' },
        { id: 'purple-3', name: 'Аметистовый', shade: 'Прозрачный фиолетовый', hex: '#9966CC' },
        { id: 'purple-4', name: 'Сливовый', shade: 'Благородный фиолетовый', hex: '#673147' }
      ],
      blue: [
        { id: 'blue-1', name: 'Небесный', shade: 'Светло-голубой', hex: '#87CEEB' },
        { id: 'blue-2', name: 'Васильковый', shade: 'Ярко-голубой', hex: '#6495ED' },
        { id: 'blue-3', name: 'Бирюзовый', shade: 'Морской', hex: '#40E0D0' },
        { id: 'blue-4', name: 'Сапфировый', shade: 'Глубокий синий', hex: '#0F52BA' }
      ],
      green: [
        { id: 'green-1', name: 'Мятный', shade: 'Свежий зеленый', hex: '#98FB98' },
        { id: 'green-2', name: 'Изумрудный', shade: 'Благородный зеленый', hex: '#50C878' },
        { id: 'green-3', name: 'Оливковый', shade: 'Мягкий зеленый', hex: '#808000' },
        { id: 'green-4', name: 'Фитста', shade: 'Салатовый', hex: '#B4D3B2' }
      ]
    },
    packaging: {
      film: [
        { id: 'film-1', name: 'Прозрачный кристалл', shade: 'Чистая прозрачность', hex: '#F8F8FF' },
        { id: 'film-2', name: 'Розовый туман', shade: 'Нежно-розовый', hex: '#FFD9E6' },
        { id: 'film-3', name: 'Голубая лагуна', shade: 'Мятно-голубой', hex: '#B0E0E6' },
        { id: 'film-4', name: 'Золотистый рассвет', shade: 'Теплый золотой', hex: '#FFF0D0' }
      ],
      paper: [
        { id: 'paper-1', name: 'Крафт', shade: 'Натуральный', hex: '#C4A484' },
        { id: 'paper-2', name: 'Рисовая', shade: 'Нежно-бежевая', hex: '#FAF0E6' },
        { id: 'paper-3', name: 'Мраморная', shade: 'Белая с прожилками', hex: '#F5F5F5' },
        { id: 'paper-4', name: 'Жемчужная', shade: 'Перламутровая', hex: '#F0F0F0' }
      ],
      boxes: [
        { id: 'box-1', name: 'Классическая белая', shade: 'Чисто-белая', hex: '#FFFFFF' },
        { id: 'box-2', name: 'Нежно-розовая', shade: 'Пудровая', hex: '#F7D1D1' },
        { id: 'box-3', name: 'Голубая', shade: 'Пастельно-голубая', hex: '#C0E0F0' },
        { id: 'box-4', name: 'Золотая', shade: 'Праздничная', hex: '#F0D8B0' }
      ]
    },
    bows: [
      { id: 'bow-1', name: 'Атласный', shade: 'Нежно-розовый', hex: '#FFB7C5' },
      { id: 'bow-2', name: 'Атласный', shade: 'Голубой', hex: '#87CEEB' },
      { id: 'bow-3', name: 'Атласный', shade: 'Сиреневый', hex: '#C8A2C8' },
      { id: 'bow-4', name: 'Атласный', shade: 'Персиковый', hex: '#FFDAB9' },
      { id: 'bow-5', name: 'Атласный', shade: 'Жемчужный', hex: '#F0F0F0' },
      { id: 'bow-6', name: 'Атласный', shade: 'Золотистый', hex: '#FFD700' },
      { id: 'bow-7', name: 'Бархатный', shade: 'Бургунди', hex: '#8B1E3F' },
      { id: 'bow-8', name: 'Бархатный', shade: 'Изумрудный', hex: '#50C878' },
      { id: 'bow-9', name: 'Бархатный', shade: 'Сапфировый', hex: '#0F52BA' }
    ]
  };

  const sizeOptions = [
    { id: 'small', name: 'Маленький (5-7 цветков)', multiplier: 1 },
    { id: 'medium', name: 'Средний (9-11 цветков)', multiplier: 1.5 },
    { id: 'large', name: 'Большой (13-15 цветков)', multiplier: 2 }
  ];

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(getApiUrl('/bouquet-components'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const components = data.data;
        
        setFlowerOptions(components.filter(c => c.type === 'flower'));
        setGreeneryOptions(components.filter(c => c.type === 'greenery'));
        setPackagingOptions(components.filter(c => c.type === 'packaging'));
      } else {
        throw new Error(data.message || 'Ошибка загрузки данных');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      setError('Не удалось загрузить компоненты для букета: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder-flower.jpg';
    if (typeof imagePath === 'string' && (imagePath.startsWith('http') || imagePath.startsWith('/'))) return imagePath;
    return '/images/placeholder-flower.jpg';
  };

  const addFlower = (flower, colorOption) => {
    setSelectedFlowers(prev => {
      const existing = prev.find(f => f.id === flower.id && f.selectedColor?.id === colorOption.id);
      if (existing) {
        return prev.map(f => 
          f.id === flower.id && f.selectedColor?.id === colorOption.id
            ? { ...f, quantity: f.quantity + 1 }
            : f
        );
      }
      return [...prev, { ...flower, quantity: 1, selectedColor: colorOption }];
    });
  };

  const removeFlower = (flowerId, colorId) => {
    setSelectedFlowers(prev => prev.filter(f => !(f.id === flowerId && f.selectedColor?.id === colorId)));
  };

  const updateFlowerQuantity = (flowerId, colorId, quantity) => {
    if (quantity < 1) {
      removeFlower(flowerId, colorId);
      return;
    }
    setSelectedFlowers(prev => prev.map(f => 
      f.id === flowerId && f.selectedColor?.id === colorId ? { ...f, quantity } : f
    ));
  };

  const toggleGreenery = (greenery) => {
    setSelectedGreenery(prev => {
      const exists = prev.find(g => g.id === greenery.id);
      return exists ? prev.filter(g => g.id !== greenery.id) : [...prev, greenery];
    });
  };

  const selectPackaging = (packaging, colorOption) => {
    setSelectedPackaging({ ...packaging, selectedColor: colorOption });
  };

  const selectBow = (bowOption) => {
    setSelectedBow(selectedBow?.id === bowOption.id ? null : bowOption);
  };

  const calculateTotalPrice = () => {
    const sizeMultiplier = sizeOptions.find(s => s.id === selectedSize)?.multiplier || 1;
    const flowersPrice = selectedFlowers.reduce((total, flower) => total + (parseFloat(flower.price) * flower.quantity * sizeMultiplier), 0);
    const greeneryPrice = selectedGreenery.reduce((total, greenery) => total + parseFloat(greenery.price), 0);
    const packagingPrice = selectedPackaging ? parseFloat(selectedPackaging.price) : 0;
    const bowPrice = selectedBow ? 80 : 0;
    return flowersPrice + greeneryPrice + packagingPrice + bowPrice;
  };

  const getDetailedComposition = () => {
    const composition = {
      name: bouquetName || 'Индивидуальный букет',
      flowers: selectedFlowers.map(f => ({
        name: f.name,
        quantity: f.quantity,
        color: f.selectedColor?.name || 'стандартный',
        shade: f.selectedColor?.shade || '',
        hex: f.selectedColor?.hex || '#FFFFFF',
        price: parseFloat(f.price) * f.quantity
      })),
      greenery: selectedGreenery.map(g => ({
        name: g.name,
        price: parseFloat(g.price)
      })),
      packaging: selectedPackaging ? {
        name: selectedPackaging.name,
        color: selectedPackaging.selectedColor?.name || 'стандартный',
        shade: selectedPackaging.selectedColor?.shade || '',
        hex: selectedPackaging.selectedColor?.hex || '#FFFFFF'
      } : null,
      bow: selectedBow ? {
        name: selectedBow.name,
        shade: selectedBow.shade,
        hex: selectedBow.hex
      } : null,
      size: sizeOptions.find(s => s.id === selectedSize)?.name || 'Средний',
      specialInstructions: specialInstructions || 'Нет',
      totalPrice: calculateTotalPrice()
    };
    return composition;
  };

  const handleAddToCart = () => {
    const totalPrice = calculateTotalPrice();
    const composition = getDetailedComposition();
    
    const customBouquet = {
      id: `custom-${Date.now()}`,
      name: bouquetName || 'Индивидуальный букет',
      price: totalPrice,
      image: selectedFlowers[0]?.image || '/images/placeholder-flower.jpg',
      description: `Индивидуальная композиция. Состав: ${selectedFlowers.map(f => `${f.name} (${f.selectedColor?.shade}) ×${f.quantity}`).join(', ')}`,
      isCustom: true,
      customDetails: {
        composition: composition,
        flowers: selectedFlowers.map(f => ({
          id: f.id,
          name: f.name,
          price: f.price,
          quantity: f.quantity,
          selectedColor: f.selectedColor
        })),
        greenery: selectedGreenery,
        packaging: selectedPackaging,
        bow: selectedBow,
        size: selectedSize,
        instructions: specialInstructions
      }
    };

    addToCart(customBouquet, 1);
    alert('Ваш индивидуальный букет добавлен в корзину!');
  };

  const nextStep = () => currentStep < 5 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const isStepValid = () => {
    if (currentStep === 1) return selectedFlowers.length > 0;
    if (currentStep === 3) return selectedPackaging !== null;
    return true;
  };

  const getFlowerShades = (flower) => {
    const flowerName = flower.name.toLowerCase();
    const flowerColor = flower.color?.toLowerCase() || '';
    
    if (flowerName.includes('роза')) {
      if (flowerColor.includes('red') || flowerName.includes('красн')) return colorPalette.flowers.red;
      if (flowerColor.includes('pink') || flowerName.includes('роз')) return colorPalette.flowers.pink;
      if (flowerColor.includes('white') || flowerName.includes('бел')) return colorPalette.flowers.white;
      if (flowerColor.includes('yellow') || flowerName.includes('желт')) return colorPalette.flowers.yellow;
      if (flowerColor.includes('orange') || flowerName.includes('оранж')) return colorPalette.flowers.orange;
      if (flowerColor.includes('purple') || flowerName.includes('фиол')) return colorPalette.flowers.purple;
      return colorPalette.flowers.pink;
    }
    if (flowerName.includes('пион')) return colorPalette.flowers.pink;
    if (flowerName.includes('тюльпан')) {
      if (flowerColor.includes('red')) return colorPalette.flowers.red;
      if (flowerColor.includes('yellow')) return colorPalette.flowers.yellow;
      if (flowerColor.includes('purple')) return colorPalette.flowers.purple;
      if (flowerColor.includes('white')) return colorPalette.flowers.white;
      return colorPalette.flowers.pink;
    }
    if (flowerName.includes('гортензия')) return colorPalette.flowers.blue;
    if (flowerName.includes('лилия')) return colorPalette.flowers.white;
    if (flowerName.includes('орхидея')) return colorPalette.flowers.purple;
    if (flowerName.includes('хризантема')) return colorPalette.flowers.yellow;
    if (flowerName.includes('подсолнух')) return colorPalette.flowers.yellow;
    if (flowerColor && colorPalette.flowers[flowerColor]) return colorPalette.flowers[flowerColor];
    return [{ id: `default-${flower.id}`, name: flower.color || 'Стандартный', shade: flower.color || 'Базовый оттенок', hex: getColorHex(flower.color) }];
  };

  if (loading) {
    return (
      <div className="custom-bouquet-page">
        <div className="container">
          <div className="loading-spinner"><div className="spinner"></div><p>Загрузка компонентов...</p></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="custom-bouquet-page">
        <div className="container">
          <div className="error-message"><h2>Ошибка</h2><p>{error}</p><button onClick={fetchComponents} className="retry-btn">Попробовать снова</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-bouquet-page">
      <div className="container">
        <section className="custom-hero">
          <div className="custom-hero-content">
            <h1>Создайте свой идеальный букет</h1>
            <p>Выберите цветы, их оттенки, зелень и оформление</p>
          </div>
        </section>

        <section className="progress-section">
          <div className="progress-bar">
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} className="progress-step">
                <div className={`step-circle ${currentStep >= step ? 'active' : ''}`}>{step}</div>
                <span className="step-label">{step === 1 ? 'Цветы' : step === 2 ? 'Зелень' : step === 3 ? 'Упаковка' : step === 4 ? 'Бант' : 'Детали'}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="custom-bouquet-layout">
          <div className="custom-content">
            {currentStep === 1 && (
              <div className="step-content">
                <h2>Выберите цветы</h2>
                <p>Нажмите на цветок, чтобы увидеть доступные оттенки</p>
                {flowerOptions.length === 0 ? <p className="no-items">Нет доступных цветов</p> : (
                  <div className="flowers-section">
                    {flowerOptions.map(flower => {
                      const flowerShades = getFlowerShades(flower);
                      return (
                        <div key={flower.id} className="flower-group">
                          <div className="flower-group-header">
                            <div className="flower-group-image"><img src={getImageUrl(flower.image)} alt={flower.name} onError={(e) => e.target.src = '/images/placeholder-flower.jpg'} /></div>
                            <div className="flower-group-info">
                              <h3>{flower.name}</h3>
                              <p className="flower-base-price">{parseFloat(flower.price).toFixed(2)} ₽/шт</p>
                              {flower.description && <p className="flower-description">{flower.description}</p>}
                            </div>
                          </div>
                          <div className="color-palette">
                            <h4>Доступные оттенки:</h4>
                            <div className="color-options">
                              {flowerShades.map(shade => {
                                const isSelected = selectedFlowers.find(f => f.id === flower.id && f.selectedColor?.id === shade.id);
                                return (
                                  <div key={shade.id} className={`color-option-card ${isSelected ? 'selected' : ''}`}>
                                    <div className="color-preview" style={{ backgroundColor: shade.hex, border: shade.name.includes('Белый') || shade.hex === '#FFFFFF' ? '2px solid #E0E0E0' : 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                      {isSelected && <span className="selected-badge">{isSelected.quantity}</span>}
                                    </div>
                                    <div className="color-details"><span className="color-name">{shade.name}</span><span className="color-shade">{shade.shade}</span></div>
                                    {isSelected ? (
                                      <div className="color-quantity-controls">
                                        <button onClick={() => updateFlowerQuantity(flower.id, shade.id, isSelected.quantity - 1)} className="quantity-btn small">-</button>
                                        <span className="quantity">{isSelected.quantity}</span>
                                        <button onClick={() => updateFlowerQuantity(flower.id, shade.id, isSelected.quantity + 1)} className="quantity-btn small">+</button>
                                        <button onClick={() => removeFlower(flower.id, shade.id)} className="remove-btn small">×</button>
                                      </div>
                                    ) : (
                                      <button className="select-color-btn" onClick={() => addFlower(flower, shade)}>Выбрать</button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="step-content">
                <h2>Добавьте зелень</h2>
                <p>Зелень придает букету объем и естественность</p>
                {greeneryOptions.length === 0 ? <p className="no-items">Нет доступной зелени</p> : (
                  <div className="greenery-grid">
                    {greeneryOptions.map(greenery => (
                      <div key={greenery.id} className={`greenery-card ${selectedGreenery.find(g => g.id === greenery.id) ? 'selected' : ''}`} onClick={() => toggleGreenery(greenery)}>
                        <div className="greenery-image"><img src={getImageUrl(greenery.image)} alt={greenery.name} onError={(e) => e.target.src = '/images/placeholder-flower.jpg'} /></div>
                        <div className="greenery-info"><h4>{greenery.name}</h4><p className="greenery-price">{parseFloat(greenery.price).toFixed(2)} ₽</p><div className="selection-indicator">{selectedGreenery.find(g => g.id === greenery.id) ? '✓ Выбрано' : 'Выбрать'}</div></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="step-content">
                <h2>Выберите упаковку</h2>
                <p>Выберите тип упаковки и её цвет</p>
                {packagingOptions.length === 0 ? <p className="no-items">Нет доступной упаковки</p> : (
                  <div className="packaging-section">
                    {packagingOptions.map(packaging => {
                      let packagingColors = colorPalette.packaging.film;
                      if (packaging.name.toLowerCase().includes('бумаг')) packagingColors = colorPalette.packaging.paper;
                      else if (packaging.name.toLowerCase().includes('коробк')) packagingColors = colorPalette.packaging.boxes;
                      return (
                        <div key={packaging.id} className="packaging-group">
                          <div className="packaging-group-header">
                            <div className="packaging-group-image"><img src={getImageUrl(packaging.image)} alt={packaging.name} onError={(e) => e.target.src = '/images/placeholder-flower.jpg'} /></div>
                            <div className="packaging-group-info"><h3>{packaging.name}</h3><p className="packaging-base-price">{parseFloat(packaging.price).toFixed(2)} ₽</p></div>
                          </div>
                          <div className="color-palette">
                            <h4>Доступные цвета:</h4>
                            <div className="color-options">
                              {packagingColors.map(color => (
                                <div key={color.id} className={`color-option-card ${selectedPackaging?.id === packaging.id && selectedPackaging?.selectedColor?.id === color.id ? 'selected' : ''}`}>
                                  <div className="color-preview" style={{ backgroundColor: color.hex, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                                  <div className="color-details"><span className="color-name">{color.name}</span><span className="color-shade">{color.shade}</span></div>
                                  {selectedPackaging?.id === packaging.id && selectedPackaging?.selectedColor?.id === color.id ? (
                                    <button className="select-color-btn selected" onClick={() => setSelectedPackaging(null)}>✓ Выбрано</button>
                                  ) : (
                                    <button className="select-color-btn" onClick={() => selectPackaging(packaging, color)}>Выбрать</button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="step-content">
                <h2>Выберите бант</h2>
                <p>Выберите цвет и тип банта для украшения</p>
                <div className="bows-section">
                  <div className="color-palette large">
                    <h4>Доступные банты:</h4>
                    <div className="color-options bows-grid">
                      {colorPalette.bows.map(bow => (
                        <div key={bow.id} className={`bow-card ${selectedBow?.id === bow.id ? 'selected' : ''}`}>
                          <div className="bow-preview" style={{ backgroundColor: bow.hex, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}><span className="bow-icon">🎀</span></div>
                          <div className="bow-details"><span className="bow-name">{bow.name}</span><span className="bow-shade">{bow.shade}</span></div>
                          <button className="select-bow-btn" onClick={() => selectBow(bow)}>{selectedBow?.id === bow.id ? '✓ Выбрано' : 'Выбрать'}</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="step-content">
                <h2>Детали заказа</h2>
                <p>Добавьте персональные пожелания</p>
                <div className="order-details">
                  <div className="form-group"><label>Название букета</label><input type="text" value={bouquetName} onChange={(e) => setBouquetName(e.target.value)} placeholder="Например: Букет для мамы" /></div>
                  <div className="form-group"><label>Особые пожелания</label><textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} placeholder="Любые особые пожелания по составу, цветам или оформлению..." rows="4" /></div>
                </div>
              </div>
            )}

            <div className="step-navigation">
              {currentStep > 1 && <button className="nav-btn secondary" onClick={prevStep}>← Назад</button>}
              {currentStep < 5 ? (
                <button className="nav-btn primary" onClick={nextStep} disabled={!isStepValid()}>Далее →</button>
              ) : (
                <button className="nav-btn success" onClick={handleAddToCart} disabled={selectedFlowers.length === 0}>Добавить в корзину за {calculateTotalPrice().toLocaleString()} ₽</button>
              )}
            </div>
          </div>

          <div className="preview-sidebar">
            <div className="preview-card">
              <h3>Ваш букет</h3>
              <div className="preview-content">
                {selectedFlowers.length === 0 ? (
                  <div className="empty-preview"><div className="empty-icon">💐</div><p>Выберите цветы для предпросмотра</p></div>
                ) : (
                  <>
                    <div className="preview-image"><img src={getImageUrl(selectedFlowers[0]?.image)} alt="Предпросмотр букета" onError={(e) => e.target.src = '/images/placeholder-flower.jpg'} /></div>
                    <div className="preview-details">
                      <h4>{bouquetName || 'Индивидуальный букет'}</h4>
                      <div className="preview-items"><strong>🌺 Цветы:</strong>{selectedFlowers.map((flower, idx) => (<div key={idx} className="preview-item"><span>{flower.name}</span><span className="preview-color-indicator"><span className="color-dot-small" style={{ backgroundColor: flower.selectedColor.hex, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />{flower.selectedColor.shade} × {flower.quantity}</span></div>))}</div>
                      {selectedGreenery.length > 0 && (<div className="preview-items"><strong>🌿 Зелень:</strong>{selectedGreenery.map(greenery => (<div key={greenery.id} className="preview-item">{greenery.name}</div>))}</div>)}
                      {selectedPackaging && (<div className="preview-items"><strong>📦 Упаковка:</strong><div className="preview-item"><span>{selectedPackaging.name}</span><span className="preview-color-indicator"><span className="color-dot-small" style={{ backgroundColor: selectedPackaging.selectedColor.hex, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />{selectedPackaging.selectedColor.shade}</span></div></div>)}
                      {selectedBow && (<div className="preview-items"><strong>🎀 Бант:</strong><div className="preview-item"><span>{selectedBow.name}</span><span className="preview-color-indicator"><span className="color-dot-small" style={{ backgroundColor: selectedBow.hex, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />{selectedBow.shade}</span></div></div>)}
                      <div className="preview-items"><strong>📏 Размер:</strong><div className="preview-item">{sizeOptions.find(s => s.id === selectedSize)?.name}</div></div>
                    </div>
                  </>
                )}
              </div>
              <div className="preview-total"><div className="total-price">Итого: <span>{calculateTotalPrice().toLocaleString()} ₽</span></div></div>
            </div>

            <div className="tips-card"><h4>💡 Советы</h4><ul className="tips-list"><li>Начните с 3-5 основных цветов для гармоничного букета</li><li>Добавьте зелень для объема и свежести</li><li>Выбирайте оттенки, которые сочетаются между собой</li><li>Бант придаст праздничный вид</li></ul></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getColorHex(color) {
  const colorMap = { 'red': '#FF4D4D', 'white': '#FFFFFF', 'pink': '#FFB7C5', 'yellow': '#FCE883', 'purple': '#E6E6FA', 'orange': '#FFDAB9', 'blue': '#87CEEB', 'green': '#98FB98', 'brown': '#C4A484', 'gold': '#FFD700', 'clear': '#F8F8FF', 'multi': '#C7A7E7' };
  return colorMap[color] || '#E0E0E0';
}