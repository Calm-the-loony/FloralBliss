import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero__overlay">
        <div className="hero__content">
          <h1 className="hero__title">Цветочная гармония для ваших моментов</h1>
          <p className="hero__subtitle">
            Свежие букеты, элегантные композиции и комнатные растения — создаём красоту, 
            которая наполняет жизнь яркими эмоциями и нежными воспоминаниями.
          </p>
          <div className="hero__details">
            <div className="detail__item">
              <span className="detail__icon">🌸</span>
              <span>Свежие цветы ежедневно</span>
            </div>
            <div className="detail__item">
              <span className="detail__icon">🚚</span>
              <span>Быстрая доставка</span>
            </div>
            <div className="detail__item">
              <span className="detail__icon">💝</span>
              <span>Индивидуальный подход</span>
            </div>
          </div>
          <div className="hero__buttons">
            <a href="#bouquets" className="hero__cta-btn primary">Выбрать букет</a>
            <a href="/compositions" className="hero__cta-btn secondary">Смотреть композиции</a>
          </div>
        </div>
        <div className="hero__image">
          <div className="flower__illustration">
            <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="200" r="80" fill="#8BC9A1" stroke="#C7A7E7" strokeWidth="4"/>
              <circle cx="200" cy="200" r="50" fill="#F5ECD7" stroke="#8BC9A1" strokeWidth="3"/>
              <circle cx="140" cy="160" r="25" fill="#C7A7E7" stroke="#8BC9A1" strokeWidth="2"/>
              <circle cx="260" cy="160" r="25" fill="#C7A7E7" stroke="#8BC9A1" strokeWidth="2"/>
              <circle cx="140" cy="240" r="25" fill="#A8D5BA" stroke="#8BC9A1" strokeWidth="2"/>
              <circle cx="260" cy="240" r="25" fill="#A8D5BA" stroke="#8BC9A1" strokeWidth="2"/>
              <circle cx="120" cy="120" r="15" fill="#C7A7E7" opacity="0.6"/>
              <circle cx="280" cy="120" r="15" fill="#A8D5BA" opacity="0.6"/>
              <circle cx="120" cy="280" r="15" fill="#8BC9A1" opacity="0.6"/>
              <circle cx="280" cy="280" r="15" fill="#C7A7E7" opacity="0.6"/>
              <rect x="195" y="280" width="10" height="80" fill="#8BC9A1" rx="5"/>
              <ellipse cx="170" cy="320" rx="20" ry="8" fill="#A8D5BA" transform="rotate(-30 170 320)"/>
              <ellipse cx="230" cy="320" rx="20" ry="8" fill="#A8D5BA" transform="rotate(30 230 320)"/>
            </svg>
          </div>
          <div className="hero__floating-elements">
            <div className="floating__item item-1">💐</div>
            <div className="floating__item item-2">🌷</div>
            <div className="floating__item item-3">🌹</div>
            <div className="floating__item item-4">🌸</div>
          </div>
        </div>
      </div>
      <div className="hero__background">
        <div className="bg__shape shape-1"></div>
        <div className="bg__shape shape-2"></div>
        <div className="bg__shape shape-3"></div>
      </div>
    </section>
  );
}

export default Hero;