import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

/* ── helpers ── */
const today = new Date().toLocaleDateString('kk-KZ', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

const TICKER_ITEMS = [
  { name: 'SEED',  val: '$340K', chg: '+12.4%', up: true },
  { name: 'SerA',  val: '$2.1M', chg: '+8.7%',  up: true },
  { name: 'ANGEL', val: '$85K',  chg: '-2.1%',  up: false },
  { name: 'VC',    val: '$5.4M', chg: '+21.0%', up: true },
  { name: 'PRE',   val: '$120K', chg: '+5.3%',  up: true },
  { name: 'EXIT',  val: '$18M',  chg: '+44.2%', up: true },
];

const MARQUEE_WORDS = [
  'Инновация', 'Инвестиция', 'Стартап', 'Аналитика',
  'Өсу',       'Капитал',   'Болашақ', 'Экосистема',
];

const FEATURES = [
  {
    num: '01',
    icon: '📝',
    title: 'Стартапты тіркеу',
    desc: 'Өз жобаңызды тіркеңіз, толық ақпарат беріңіз және инвесторлардың назарын аударыңыз.',
    big: true,
  },
  {
    num: '02',
    icon: '📈',
    title: 'Даму бақылауы',
    desc: 'Стартаптың барлық даму кезеңдерін қадағалаңыз және нәтижелерді талдаңыз.',
  },
  {
    num: '03',
    icon: '🎯',
    title: 'Инвестор аналитикасы',
    desc: 'Деректерге негізделген ұсыныстар мен толық аналитикалық құралдар алыңыз.',
  },
  {
    num: '04',
    icon: '🤝',
    title: 'Тікелей байланыс',
    desc: 'Инвесторлар мен кәсіпкерлер арасында тікелей коммуникация жасаңыз.',
  },
  {
    num: '05',
    icon: '🔒',
    title: 'Қауіпсіздік',
    desc: 'Барлық деректер қорғалған және толық құпиялылық сақталады.',
  },
];

/* ── component ── */
const Home: React.FC = () => {
  return (
    <div className="home-container">
      <video className="bg-video" autoPlay muted loop playsInline>
    <source src="/bg1.mp4" type="video/mp4" />
  </video>

      {/* ═══════════════════ TICKER BAR ═══════════════════ */}
      <div className="ticker-bar">
        <div className="ticker-label">Live</div>
        <div className="ticker-track-wrap">
          <div className="ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
              <div className="ticker-item" key={i}>
                <span className="ticker-name">{t.name}</span>
                <span className="ticker-val">{t.val}</span>
                <span className={`ticker-chg ${t.up ? 'up' : 'down'}`}>{t.chg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════ MASTHEAD ═══════════════════ */}
      <header className="masthead">
        <div className="masthead-top">
          <div className="masthead-date">{today}</div>
          <div className="masthead-logo">
            <span className="masthead-logo-text">
              Fintech <em>Hub</em>
            </span>
            <span className="masthead-logo-sub">Қазақстандағы №1 инвестиция платформасы</span>
          </div>
          <div className="masthead-edition">
            Астана&nbsp;·&nbsp;Басылым&nbsp;№ 001
          </div>
        </div>

        <nav className="masthead-nav">
          <span className="nav-item active">Басты бет</span>
          <span className="nav-item">Стартаптар</span>
          <span className="nav-item">Инвесторлар</span>
          <span className="nav-item">Аналитика</span>
          <span className="nav-item">Жаңалықтар</span>
          <div className="nav-cta">


          </div>
        </nav>
      </header>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="hero">
        <div className="hero-rule">
          <div className="hero-rule-line" />
          <span className="hero-rule-label">Басты тақырып</span>
          <div className="hero-rule-line" />
        </div>

        <div className="hero-grid">

          {/* LEFT — live stats */}
          <div className="hero-col-left">
            <div className="stat-block">
              <div className="stat-block-label">Жалпы стартаптар</div>
              <div className="stat-block-number">
                3<em>40</em><span style={{fontSize:'0.4em', color:'var(--gold)'}}>+</span>
              </div>
              <div className="stat-block-sub">
                <span className="up">▲ 12%</span> осы айда
              </div>
            </div>
            <div className="stat-block">
              <div className="stat-block-label">Инвесторлар</div>
              <div className="stat-block-number">1<em>20</em><span style={{fontSize:'0.4em', color:'var(--gold)'}}>+</span></div>
              <div className="stat-block-sub">
                <span className="up">▲ 8%</span> осы тоқсанда
              </div>
            </div>
            <div className="stat-block">
              <div className="stat-block-label">Инвестициялар</div>
              <div className="stat-block-number"><em>$4</em>M<span style={{fontSize:'0.4em', color:'var(--gold)'}}>+</span></div>
              <div className="stat-block-sub">
                <span className="up">▲ 44%</span> жылдың аяғына дейін
              </div>
            </div>
          </div>

          {/* CENTER — headline */}
          <div className="hero-col-center">
            <div className="hero-kicker">Арнайы репортаж</div>
            <h1 className="hero-title">
              Инвестициялар мен
              <em>инновациялар</em>
              бір платформада
            </h1>
            <div className="hero-divider" />
            <p className="hero-description">
              Fintech Hub — стартаптарды тіркеу, олардың даму кезеңдерін бақылау және 
              инвесторларға арналған аналитика ұсынатын платформа. Деректер негізінде 
              шешім қабылдаңыз, дұрыс серіктес табыңыз.
            </p>
            <div className="hero-actions">

            </div>
          </div>

          {/* RIGHT — floating market cards */}
          <div className="hero-col-right">
            <div className="market-card">
              <div className="market-card-top">
                <div className="market-card-icon">📊</div>
                <div className="market-card-badge">Live</div>
              </div>
              <div className="market-card-title">Аналитика</div>
              <div className="market-card-value">98.4%</div>
              <div className="market-card-trend">▲ дәлдік деңгейі</div>
            </div>
            <div className="market-card">
              <div className="market-card-top">
                <div className="market-card-icon">🚀</div>
                <div className="market-card-badge">Hot</div>
              </div>
              <div className="market-card-title">Белсенді стартаптар</div>
              <div className="market-card-value">47</div>
              <div className="market-card-trend">▲ +12 бұл апта</div>
            </div>
            <div className="market-card">
              <div className="market-card-top">
                <div className="market-card-icon">💰</div>
                <div className="market-card-badge">New</div>
              </div>
              <div className="market-card-title">Раунд көлемі</div>
              <div className="market-card-value">$340K</div>
              <div className="market-card-trend">▲ орташа seed</div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════ MARQUEE ═══════════════════ */}
      <div className="marquee-strip" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <div className="marquee-item" key={i}>
              <div className="dot" />
              {w}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════ DATA STRIP ═══════════════════ */}
      <div className="data-strip">
        {[
          { num: '340', suffix: '+',   label: 'Тіркелген стартаптар', sub: 'Астанадан 60% астам' },
          { num: '$4',  suffix: 'M+',  label: 'Жиналған инвестиция',  sub: '2026 жылдан бері' },
          { num: '120', suffix: '+',   label: 'Белсенді инвесторлар', sub: 'Angel & VC' },
          { num: '89',  suffix: '%',   label: 'Сәтті сәйкестендіру', sub: 'Startup ↔ Investor' },
        ].map((d, i) => (
          <div className="data-strip-item" key={i}>
            <div className="data-strip-num">
              {d.num}<span className="suffix">{d.suffix}</span>
            </div>
            <div className="data-strip-label">{d.label}</div>
            <div className="data-strip-sub">{d.sub}</div>
          </div>
        ))}
      </div>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section className="features">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Мүмкіндіктер</div>
            <h2 className="section-title">
              Нені <em>ұсынамыз</em>
            </h2>
          </div>
          <p className="section-subtitle">
            Инвесторлар мен кәсіпкерлер арасындағы байланысты жеңілдетеміз
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-num">{f.num}</div>
              <div className="feature-icon-wrap">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-description">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="cta">
        <div className="cta-content">
          <div className="cta-eyebrow">Шақыру</div>
          <h2 className="cta-title">
            Бүгіннен
            <em>бастаңыз</em>
          </h2>
          <p className="cta-description">
            Fintech Hub қауымдастығына қосылып, өз мүмкіндіктеріңізді кеңейтіңіз. 
            Дұрыс серіктес табу — бір тіркелуден басталады.
          </p>
          <div className="cta-buttons">
          </div>
        </div>

        <div className="cta-side">
          <div className="cta-quote">
            <div className="cta-quote-mark">"</div>
            <p className="cta-quote-text">
              Fintech Hub арқылы дұрыс инвесторды 3 апта ішінде таптым. 
              Бұл платформа Қазақстан экосистемасын өзгертеді.
            </p>
            <div className="cta-quote-author">
              Айдос Бектұров<span>· Seed раунды, $280K</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════
      <footer className="footer">
        <div className="footer-masthead">
          <div className="footer-logo-text">
            Fintech <em>Hub</em>
          </div>
          <div className="footer-tagline">
            Инвестициялар мен инновациялар үшін платформа — Алматы, Қазақстан
          </div>
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
      </footer> */}

    </div>
  );
};

export default Home;