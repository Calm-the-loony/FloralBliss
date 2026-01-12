import React from 'react';
import './Advantages.css';

const advantages = [
  { 
    title: "Свежие цветы", 
    description: "Ежедневные поставки от проверенных поставщиков с гарантией качества" 
  },
  { 
    title: "Быстрая доставка", 
    description: "Доставка за 2 часа в пределах города в удобное для вас время" 
  },
  { 
    title: "Индивидуальный подход", 
    description: "Создаём уникальные букеты под ваш повод, бюджет и предпочтения" 
  },
  { 
    title: "Гарантия качества", 
    description: "Фотографируем букет перед отправкой и всегда готовы к диалогу" 
  },
];

const Advantages = () => {
  return (
    <section className="advantages" id="advantages">
      <div className="advantages__container">
        <div className="advantages__header">
          <h2 className="advantages__title">Наши преимущества</h2>
          <p className="advantages__subtitle">
            Всё, что важно для идеального цветочного подарка
          </p>
        </div>
        
        <div className="advantages__list">
          {advantages.map((advantage, index) => (
            <div key={index} className="advantage__item">
              <div className="advantage__number">
                <span>0{index + 1}</span>
              </div>
              <div className="advantage__content">
                <h3 className="advantage__title">{advantage.title}</h3>
                <p className="advantage__description">{advantage.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;