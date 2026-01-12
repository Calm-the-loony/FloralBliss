import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__section footer__brand">
          <div className="footer__logo">
            <div className="logo__icon">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 16C16 10 20 6 26 6C26 12 22 16 16 16Z" fill="#C7A7E7" stroke="#8BC9A1" strokeWidth="2"/>
                <path d="M16 16C16 22 12 26 6 26C6 20 10 16 16 16Z" fill="#8BC9A1" stroke="#C7A7E7" strokeWidth="2"/>
                <path d="M16 16C10 16 6 12 6 6C12 6 16 10 16 16Z" fill="#A8D5BA" stroke="#8BC9A1" strokeWidth="2"/>
                <path d="M16 16C22 16 26 20 26 26C20 26 16 22 16 16Z" fill="#C7A7E7" stroke="#8BC9A1" strokeWidth="2"/>
                <circle cx="16" cy="16" r="4" fill="#F5ECD7" stroke="#8BC9A1" strokeWidth="2"/>
              </svg>
            </div>
            <span className="logo__text">Floral Bliss</span>
          </div>
          <p>Создаём красоту и гармонию в каждом букете. Нежные цветы для ваших особенных моментов.</p>
        </div>

        <div className="footer__section">
          <h4>Навигация</h4>
          <ul>
            <li><a href="#bouquets">Букеты</a></li>
            <li><a href="#plants">Растения</a></li>
            <li><a href="#compositions">Композиции</a></li>
            <li><a href="#about">О нас</a></li>
            <li><a href="#delivery">Доставка</a></li>
          </ul>
        </div>

        <div className="footer__section">
          <h4>Контакты</h4>
          <ul>
            <li>Ростов-на-Дону, ул. Пушкинская, 150</li>
            <li>+7 (999) 123-45-67</li>
            <li>floralbliss@example.com</li>
            <li>Ежедневно 9:00 - 21:00</li>
          </ul>
        </div>

        <div className="footer__section">
          <h4>Услуги</h4>
          <ul>
            <li>Свадебные букеты</li>
            <li>Цветы на праздник</li>
            <li>Комнатные растения</li>
            <li>Флористические композиции</li>
            <li>Быстрая доставка</li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} Floral Bliss. Все права защищены.</p>
      </div>
    </footer>
  );
}