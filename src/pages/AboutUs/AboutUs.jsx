import React from 'react';
import { Link } from 'react-router-dom';
import './AboutUs.css';

export default function AboutUs() {
  const teamMembers = [
    {
      id: 1,
      name: "Анна Иванова",
      position: "Основатель, флорист",
      image: "https://content.onliner.by/news/1200x5616/de5ce5e0dc9a6b9f1add4146b8207233.jpg",
      description: "Создаёт уникальные композиции с 2015 года. Специалист по свадебной флористике."
    },
    {
      id: 2,
      name: "Мария Петрова",
      position: "Ведущий флорист",
      image: "https://kartin.papik.pro/uploads/posts/2023-06/thumbs/1687158647_kartin-papik-pro-p-kartinki-florist-s-tsvetami-1.jpg",
      description: "Мастер минимализма и современных флористических решений."
    },
    {
      id: 3,
      name: "Елена Сидорова",
      position: "Менеджер по клиентам",
      image: "https://avatars.mds.yandex.net/get-altay/14920824/2a00000195d7acd4ff2cacc9f781bc2c2912/orig",
      description: "Заботится, чтобы ваш букет пришёл вовремя и в идеальном состоянии."
    }
  ];

  const stats = [
    { number: "5+", label: "Лет на рынке" },
    { number: "2 500+", label: "Довольных клиентов" },
    { number: "15 000+", label: "Созданных букетов" },
    { number: "98%", label: "Положительных отзывов" }
  ];

  const values = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z"/>
        </svg>
      ),
      title: "Свежесть",
      description: "Только утренние цветы от проверенных поставщиков."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ),
      title: "Качество",
      description: "Каждая композиция — внимание к деталям."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z"/>
        </svg>
      ),
      title: "Скорость",
      description: "Доставка в течение 2 часов по городу."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      title: "Креативность",
      description: "Уникальные решения для ваших особых моментов."
    }
  ];

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>О нас</h1>
          <p className="hero-subtitle">
            Создаём эмоции через цветы с 2019 года. Наша миссия — дарить радость и вдохновение с помощью живых флористических композиций.
          </p>
        </div>
        <div className="hero-flower-decoration">
          <div className="flower">🌸</div>
          <div className="flower">🌿</div>
          <div className="flower">💐</div>
        </div>
      </section>

      <section className="about-story">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <h2>Наша история</h2>
              <p>
                Всё началось с маленькой лавки в центре Ростова-на-Дону, где Анна Иванова создавала букеты для друзей. Её страсть и внимание к деталям быстро завоевали сердца.
              </p>
              <p>
                Сегодня Floral Bliss — это команда профессионалов, которая сохраняет тёплую атмосферу и индивидуальный подход, даже став узнаваемым брендом.
              </p>
              <div className="story-features">
                <div className="feature">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                  </div>
                  <span className="feature-text">Индивидуальный подход к каждому заказу</span>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 17a2 2 0 100-4 2 2 0 000 4zM19 17a2 2 0 100-4 2 2 0 000 4z"/>
                      <path d="M13 16h6V3a1 1 0 00-1-1H6a1 1 0 00-1 1v13h6M8 6h8M8 10h8"/>
                    </svg>
                  </div>
                  <span className="feature-text">Бесплатная доставка по городу</span>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <span className="feature-text">Премиальные сорта цветов</span>
                </div>
              </div>
            </div>
            <div className="story-image">
              <img 
                src="https://fd8f3b0d-a4a5-424f-9d57-1156ad7104f7.selcdn.net/uploads/images/95170/large_29-11-2021_14-19-41.jpg" 
                alt="Наша мастерская"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="about-stats">
        <div className="container">
          <h2>Floral Bliss в цифрах</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="container">
          <h2>Наши ценности</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-team">
        <div className="container">
          <h2>Наша команда</h2>
          <p className="team-subtitle">
            Талантливые флористы и менеджеры, которые вкладывают душу в каждый букет
          </p>
          <div className="team-grid">
            {teamMembers.map(member => (
              <div key={member.id} className="team-card">
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <p className="team-position">{member.position}</p>
                  <p className="team-description">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="about-cta-container">
          <div className="about-cta-content">
            <h2>Готовы создать что-то прекрасное вместе?</h2>
            <p className="about-cta-subtitle">
              Обращайтесь к нам для идеального букета — от романтики до корпоратива.
            </p>
            <div className="about-cta-buttons">
              <Link to="/bouquets" className="about-cta-button primary">Смотреть каталог</Link>
              <Link to="/custom" className="about-cta-button secondary">Заказать дизайн</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}