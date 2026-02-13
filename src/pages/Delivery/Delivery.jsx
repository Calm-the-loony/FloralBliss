import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Delivery.css';

const Icons = {
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  photo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-2.5-2.5L16 15"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  city: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 21l18 0M9 21v-8M15 21v-5M5 21l0-6M19 21l0-3"/>
      <rect x="8" y="7" width="8" height="6" rx="1"/>
    </svg>
  ),
  region: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7z"/>
    </svg>
  ),
  russia: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 5h18M3 9h18M3 13h12M3 17h10M3 21h8"/>
    </svg>
  )
};

export default function Delivery() {
  const [activeTab, setActiveTab] = useState('rostov');

  const deliveryOptions = [
    {
      id: 'rostov',
      city: 'Ростов-на-Дону',
      time: '1–2 часа',
      price: 'Бесплатно',
      minOrder: 'от 1 500 ₽',
      description: 'Быстрая доставка по всему городу в удобное для вас время',
      features: ['Курьерская доставка', 'СМС-уведомления', 'Фотоотчёт', 'Выбор временного интервала'],
      icon: Icons.city
    },
    {
      id: 'rostov-region',
      city: 'Ростовская область',
      time: '2–4 часа',
      price: 'от 250 ₽',
      minOrder: 'от 2 000 ₽',
      description: 'Доставка в ближайшие города области',
      features: ['Курьерская доставка', 'Предварительный звонок', 'Точное время доставки'],
      icon: Icons.region
    },
    {
      id: 'russia',
      city: 'По России',
      time: '1–3 дня',
      price: 'от 400 ₽',
      minOrder: 'от 2 500 ₽',
      description: 'Доставка транспортными компаниями по всей стране',
      features: ['СДЭК, Boxberry', 'Трек-номер', 'Страхование'],
      icon: Icons.russia
    }
  ];

  const deliveryZones = [
    { zone: 'Центр города', time: '1–2 часа', price: 'Бесплатно', minOrder: '1 500 ₽' },
    { zone: 'Северный, Западный', time: '2–3 часа', price: '200 ₽', minOrder: '1 500 ₽' },
    { zone: 'Александровка', time: '2–3 часа', price: '250 ₽', minOrder: '1 800 ₽' },
    { zone: 'Нахичевань, ЗЖМ', time: '2–3 часа', price: '200 ₽', minOrder: '1 500 ₽' }
  ];

  const workingHours = [
    { day: 'Пн–Пт', hours: '8:00–22:00' },
    { day: 'Сб', hours: '9:00–21:00' },
    { day: 'Вс', hours: '9:00–20:00' }
  ];

  const faqItems = [
    {
      question: 'Можно ли заказать доставку в ночное время?',
      answer: 'Да, возможна доставка с 22:00 до 8:00 с доплатой 800 ₽. Заказ нужно оформить минимум за 24 часа.'
    },
    {
      question: 'Что если меня не будет дома?',
      answer: 'Курьер свяжется за 30–60 минут. Если вас не будет, мы согласуем другое время или оставим букет соседям/консьержу.'
    },
    {
      question: 'Можно ли изменить адрес после оформления?',
      answer: 'Да, если заказ ещё не передан курьеру. Позвоните нам: +7 (863) 123-45-67.'
    },
    {
      question: 'Как сохраняется свежесть цветов?',
      answer: 'Мы используем термоконтейнеры и влагоудерживающие материалы. Каждый букет упакован индивидуально.'
    }
  ];

  return (
    <div className="delivery-page">
      <section className="delivery-hero">
        <div className="container">
          <div className="delivery-hero-content">
            <h1>Доставка, как забота</h1>
            <p className="hero-subtitle">
              Бережно доставляем свежие цветы по Ростову-на-Дону и всей России.  
              Каждый букет — в идеальном состоянии, вовремя и с улыбкой.
            </p>
            <div className="hero-features">
              {[
                { icon: Icons.truck, text: 'Бесплатно от 1 500 ₽' },
                { icon: Icons.clock, text: 'От 1 часа по городу' },
                { icon: Icons.photo, text: 'Фотоотчёт о доставке' }
              ].map((item, i) => (
                <div key={i} className="feature">
                  <div className="feature-icon">{item.icon}</div>
                  <span className="feature-text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-flower-decoration">
          <div className="flower">🌸</div>
          <div className="flower">🌿</div>
          <div className="flower">💐</div>
        </div>
      </section>

      <section className="delivery-options">
        <div className="container">
          <h2>Выберите, как вам удобно</h2>
          <div className="tabs-container">
            <div className="tabs-header">
              {deliveryOptions.map(option => (
                <button
                  key={option.id}
                  className={`tab-button ${activeTab === option.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(option.id)}
                >
                  <div className="tab-icon">{option.icon}</div>
                  {option.city}
                </button>
              ))}
            </div>
            <div className="tab-content">
              {deliveryOptions.map(option => (
                <div key={option.id} className={`tab-panel ${activeTab === option.id ? 'active' : ''}`}>
                  <div className="option-card">
                    <div className="option-header">
                      <div className="option-info">
                        <h3>Доставка в {option.city}</h3>
                        <p className="option-description">{option.description}</p>
                      </div>
                      <div className="option-stats">
                        {[
                          { label: 'Время', value: option.time },
                          { label: 'Стоимость', value: option.price },
                          { label: 'Мин. заказ', value: option.minOrder }
                        ].map((stat, i) => (
                          <div key={i} className="stat">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="option-features">
                      <h4>Что включено:</h4>
                      <div className="features-grid">
                        {option.features.map((feature, i) => (
                          <div key={i} className="feature-item">
                            <div className="check-icon">{Icons.check}</div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="delivery-zones">
        <div className="container">
          <h2>Зоны доставки по Ростову</h2>
          
          <div className="zones-container">
            <div className="zones-visual">
              <div className="city-center-map">
                {['Центр', 'Северный', 'Александровка', 'ЗЖМ'].map((zone, i) => (
                  <div key={i} className="map-zone">{zone}</div>
                ))}
              </div>
              
              <div className="zone-list">
                <h3>Все районы города</h3>
                <div className="zones-grid">
                  {deliveryZones.map((zone, i) => (
                    <div key={i} className="zone-card">
                      <div className="zone-header">
                        <h3>{zone.zone}</h3>
                        <div className="zone-price">{zone.price}</div>
                      </div>
                      <div className="zone-details">
                        <div className="detail">
                          <span className="detail-label">Время доставки</span>
                          <span className="detail-value">{zone.time}</span>
                        </div>
                        <div className="detail">
                          <span className="detail-label">Минимальный заказ</span>
                          <span className="detail-value">{zone.minOrder}</span>
                        </div>
                        <div className="detail">
                          <span className="detail-label">Доставка</span>
                          <span className="detail-value">{zone.time === '1–2 часа' ? 'Быстрая' : 'Стандартная'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <p className="zone-note">
              * Бесплатная доставка действует при заказе от 1 500 ₽ в пределах центра города. 
              При заказе в другие районы стоимость доставки фиксированная и не зависит от суммы заказа.
            </p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2>Как проходит доставка</h2>
          <div className="steps-grid">
            {[
              { num: 1, title: 'Выберите букет', desc: 'Из каталога или создайте уникальный' },
              { num: 2, title: 'Укажите детали', desc: 'Адрес, время, открытку и пожелания' },
              { num: 3, title: 'Подтверждение', desc: 'Мы свяжемся для уточнения деталей' },
              { num: 4, title: 'Доставка', desc: 'Курьер привезёт букет и отправит фотоотчёт' }
            ].map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="delivery-info">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <h3>🕒 Время работы</h3>
              <div className="schedule">
                {workingHours.map((item, i) => (
                  <div key={i} className="schedule-item">
                    <span className="day">{item.day}</span>
                    <span className="hours">{item.hours}</span>
                  </div>
                ))}
              </div>
              <p className="note">* Ночная доставка (22:00–8:00) — +800 ₽</p>
            </div>
            <div className="info-card">
              <h3>💌 Свяжитесь с нами</h3>
              <div className="contacts">
                <div className="contact-item">
                  <span className="contact-label">Телефон:</span>
                  <a href="tel:+78631234567" className="contact-value">+7 (863) 123-45-67</a>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Telegram:</span>
                  <a href="https://t.me/floralbliss_rostov" className="contact-value">@floralbliss_rostov</a>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <a href="mailto:delivery@floralbliss.ru" className="contact-value">delivery@floralbliss.ru</a>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Адрес:</span>
                  <span className="contact-value">Ростов-на-Дону, ул. Пушкинская, 150</span>
                </div>
              </div>
              <p className="note">Пишите в Telegram — ответим мгновенно 💐</p>
            </div>
          </div>
        </div>
      </section>

      <section className="delivery-faq">
        <div className="container">
          <h2>Частые вопросы</h2>
          <div className="faq-grid">
            {faqItems.map((item, i) => (
              <div key={i} className="faq-item">
                <h4>{item.question}</h4>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="delivery-cta-harmonized">
        <div className="delivery-cta-container">
          <div className="delivery-cta-content">
            <h2>Готовы заказать доставку в Ростове?</h2>
            <p className="delivery-cta-subtitle">
              Выберите свежий букет из каталога — доставим его бережно и вовремя по всему городу.
            </p>
            <div className="delivery-cta-buttons">
              <Link to="/bouquets" className="delivery-cta-button primary">
                Смотреть каталог
              </Link>
              <Link to="/custom-bouquet" className="delivery-cta-button secondary">
                Заказать дизайн
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}