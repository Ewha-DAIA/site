import { CONFIG } from '../config.js';
import { getLang, setLang, pick } from '../utils/lang.js?v=3';

// Number of news items shown before "더 보기"
const NEWS_PREVIEW = 6;
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

async function discoverHomeImages() {
  // Try GitHub API first (works on GitHub Pages)
  try {
    const res = await fetch('https://api.github.com/repos/Ewha-DAIA/site/contents/assets/home');
    if (res.ok) {
      const files = await res.json();
      const images = files
        .filter(f => f.type === 'file' && IMAGE_EXTENSIONS.some(ext => f.name.toLowerCase().endsWith('.' + ext)))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(f => `./assets/home/${f.name}`);
      if (images.length > 0) return images;
    }
  } catch (e) {
    // API unavailable (local dev, rate-limited, etc.)
  }

  // Fallback: probe background_1 ~ background_20 (skips gaps)
  const images = [];
  for (let i = 1; i <= 20; i++) {
    for (const ext of IMAGE_EXTENSIONS) {
      try {
        const path = `./assets/home/background_${i}.${ext}`;
        const res = await fetch(path, { method: 'HEAD' });
        if (res.ok) {
          images.push(path);
          break;
        }
      } catch (e) { /* skip */ }
    }
  }
  return images;
}

export async function mount() {
  let images = await discoverHomeImages();

  if (images.length === 0) {
    images = ['./assets/home/background_1.jpg'];
  }
  
  const slider = document.getElementById('home-visual-slider');
  if (!slider) return;
  
  let currentIndex = Math.floor(Math.random() * images.length);
  
  images.forEach(src => {
    const img = new Image();
    img.src = src;
  });
  
  function showImage(index) {
    slider.style.backgroundImage = `url('${images[index]}')`;
  }
  
  window.sliderNext = () => {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
    resetAutoplay();
  };
  
  window.sliderPrev = () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
    resetAutoplay();
  };
  
  function resetAutoplay() {
    if (window.homeSliderInterval) clearInterval(window.homeSliderInterval);
    window.homeSliderInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex);
    }, 6000);
  }
  
  showImage(currentIndex);
  resetAutoplay();
}

// Link panels and the news list; redrawn on language switch without touching the slider
function renderDynamic(news, lang) {
  const ko = lang === 'ko';
  const formatDate = (dateStr) => {
    const [year, month] = dateStr.split('-');
    if (ko) return `${year}.${month}`;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };
  return `
    <section class="home-paths">
      <a href="#/research" class="home-path">
        <p class="home-path-kicker">${ko ? '연구 분야' : 'Research'}</p>
        <h3 class="home-path-title">${ko ? 'AI 기술을 연구하고, 현장의 문제에 적용합니다' : 'We research AI and apply it to real problems'}</h3>
        <p class="home-path-desc">${ko ? '에이전틱 AI, 정보 검색, 자연어 처리 등 코어 AI 연구와 제조·법률·금융 등 여러 분야의 응용 연구를 소개합니다.' : 'Core AI research such as agentic AI, retrieval, and NLP, and applied research across manufacturing, law, finance, and more.'}</p>
        <span class="home-path-link">${ko ? '연구 분야 보기' : 'See our research'} →</span>
      </a>
      <a href="#/join" class="home-path home-path-join">
        <p class="home-path-kicker">Join Us</p>
        <h3 class="home-path-title">${ko ? 'DAIA Lab과 함께할 학생을 모집합니다' : 'Join DAIA Lab'}</h3>
        <p class="home-path-desc">${ko ? '학부 인턴과 석사·박사 과정생을 모집합니다. 관심 도메인이 있는 학생도, AI 기술 자체에 관심 있는 학생도 환영합니다.' : 'Undergraduate interns and M.S./Ph.D. students are welcome, whether you care about a domain or about AI itself.'}</p>
        <span class="home-path-link">${ko ? '모집 안내 보기' : 'How to join'} →</span>
      </a>
    </section>

    <section class="home-highlights">
      <div class="highlights-container highlights-full-width">
        <div class="highlight-section news-section-compact">
          <div class="news-header-compact">
            <h2 class="section-title-compact">${ko ? '최근 소식' : 'Latest News'}</h2>
          </div>
          <div class="news-list-compact" id="news-list">
            ${news.map((item, i) => `
              <div class="news-row-compact ${i >= NEWS_PREVIEW ? 'news-extra' : ''}">
                <span class="news-date-compact">${formatDate(item.date)}</span>
                <p class="news-content-compact">${pick(item, 'content', lang)}</p>
              </div>
            `).join('')}
          </div>
          ${news.length > NEWS_PREVIEW ? `
            <button class="news-more" onclick="toggleNewsMore(this)" data-more="${ko ? '더 보기' : 'Show more'}" data-less="${ko ? '접기' : 'Show less'}">${ko ? '더 보기' : 'Show more'}</button>
          ` : ''}
        </div>
      </div>
    </section>

  `;
}

export default async function Home() {
  let news = [];
  try {
    const newsResponse = await fetch('./data/news.json', { cache: 'no-cache' });
    news = await newsResponse.json();
    news.sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error('Failed to load news:', error);
  }

  window.toggleNewsMore = (btn) => {
    const list = document.getElementById('news-list');
    const open = list.classList.toggle('is-open');
    btn.textContent = open ? btn.dataset.less : btn.dataset.more;
  };

  window.toggleNewsLang = (next) => {
    setLang(next);
    document.getElementById('home-dynamic').innerHTML = renderDynamic(news, next);
  };


  return `
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gradient-text">Data</span>
          <span class="outline-text">&</span>
          <span class="gradient-text">AI</span><br>
          <span class="outline-text">Applications</span>
        </h1>
        <p class="hero-subtitle">
          ${CONFIG.LAB_DESCRIPTION}
        </p>
        <div class="hero-actions">
          <a href="#/publications/international" class="btn btn-primary">Our Research</a>
          <a href="#/people" class="btn btn-secondary">Meet the Team</a>
        </div>
      </div>
      
      <div class="hero-visual">
        <div id="home-visual-slider" class="visual-slider"></div>
        <button class="slider-arrow slider-arrow-left" onclick="sliderPrev()">‹</button>
        <button class="slider-arrow slider-arrow-right" onclick="sliderNext()">›</button>
      </div>
    </section>

    <div id="home-dynamic">${renderDynamic(news, getLang())}</div>
  `;
}
