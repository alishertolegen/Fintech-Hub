import React from 'react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Инвестициялар мен инновациялар
            <span className="gradient-text"> бір платформада</span>
          </h1>
          <p className="hero-description">
            Fintech Hub — стартаптарды тіркеу, олардың даму кезеңдерін бақылау және 
            инвесторларға арналған аналитика ұсынатын веб-платформа. Деректер негізінде 
            шешім қабылдаңыз.
          </p>
          <div className="hero-buttons">
            <button className="btn-hero-primary">Стартапты тіркеу</button>
            <button className="btn-hero-secondary">Инвестор ретінде қосылу</button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">250+</div>
              <div className="stat-label">Стартаптар</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">120+</div>
              <div className="stat-label">Инвесторлар</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">$50M+</div>
              <div className="stat-label">Инвестициялар</div>
            </div>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="floating-card card-1">
            <div className="card-icon">📊</div>
            <div className="card-title">Аналитика</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">🚀</div>
            <div className="card-title">Стартаптар</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">💰</div>
            <div className="card-title">Инвестициялар</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2 className="section-title">Платформаның мүмкіндіктері</h2>
          <p className="section-subtitle">
            Инвесторлар мен кәсіпкерлер арасындағы байланысты жеңілдетеміз
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3 className="feature-title">Стартапты тіркеу</h3>
            <p className="feature-description">
              Өз жобаңызды тіркеңіз, толық ақпарат беріңіз және инвесторлардың назарын аударыңыз
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3 className="feature-title">Даму кезеңдерін бақылау</h3>
            <p className="feature-description">
              Стартаптың барлық даму кезеңдерін қадағалаңыз және нәтижелерді талдаңыз
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Инвесторларға аналитика</h3>
            <p className="feature-description">
              Толық аналитикалық құралдар мен деректерге негізделген ұсыныстар алыңыз
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3 className="feature-title">Тікелей байланыс</h3>
            <p className="feature-description">
              Инвесторлар мен кәсіпкерлер арасында тікелей коммуникация жасаңыз
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Қауіпсіздік</h3>
            <p className="feature-description">
              Барлық деректер қорғалған және құпия сақталады
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Жылдам шешім</h3>
            <p className="feature-description">
              AI көмегімен жылдам және дәл шешімдер қабылдаңыз
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2 className="cta-title">Бүгіннен бастаңыз</h2>
          <p className="cta-description">
            Fintech Hub қауымдастығына қосылып, өз мүмкіндіктеріңізді кеңейтіңіз
          </p>
          <button className="btn-cta">Тегін бастау</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">💎</span>
              <span className="logo-text">Fintech Hub</span>
            </div>
            <p className="footer-text">
              Инвестициялар мен инновациялар үшін платформа
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Платформа</h4>
            <a href="#" className="footer-link">Стартаптар</a>
            <a href="#" className="footer-link">Инвесторлар</a>
            <a href="#" className="footer-link">Аналитика</a>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Компания</h4>
            <a href="#" className="footer-link">Біз туралы</a>
            <a href="#" className="footer-link">Байланыс</a>
            <a href="#" className="footer-link">Карьера</a>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Қолдау</h4>
            <a href="#" className="footer-link">Анықтама</a>
            <a href="#" className="footer-link">FAQ</a>
            <a href="#" className="footer-link">Құпиялылық</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Fintech Hub. Барлық құқықтар қорғалған.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;