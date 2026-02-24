// components/Footer.tsx
import React from 'react';
import './Home.css'; // при желании можно использовать Home.css — разделяй стили

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-masthead">
        <div className="footer-logo-text">Fintech <em>Hub</em></div>
        <div className="footer-tagline">Инвестициялар мен инновациялар үшін платформа — Алматы, Қазақстан</div>
      </div>

      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-section-title">Платформа туралы</div>
          <p className="footer-text">
            Fintech Hub — стартаптар мен инвесторларды байланыстыратын, 
            деректерге негізделген шешімдер қабылдауға көмектесетін платформа.
          </p>
        </div>

        <div className="footer-section">
          <div className="footer-section-title">Платформа</div>
          <a href="#" className="footer-link">Стартаптар</a>
          <a href="#" className="footer-link">Инвесторлар</a>
          <a href="#" className="footer-link">Аналитика</a>
          <a href="#" className="footer-link">Жаңалықтар</a>
        </div>

        <div className="footer-section">
          <div className="footer-section-title">Компания</div>
          <a href="#" className="footer-link">Біз туралы</a>
          <a href="#" className="footer-link">Байланыс</a>
          <a href="#" className="footer-link">Карьера</a>
        </div>

        <div className="footer-section">
          <div className="footer-section-title">Қолдау</div>
          <a href="#" className="footer-link">Анықтама</a>
          <a href="#" className="footer-link">FAQ</a>
          <a href="#" className="footer-link">Құпиялылық</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Fintech Hub · Барлық құқықтар қорғалған.</p>
        <div className="footer-bottom-links">
          <span className="footer-bottom-link">Шарттар</span>
          <span className="footer-bottom-link">Құпиялылық</span>
          <span className="footer-bottom-link">Cookies</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;