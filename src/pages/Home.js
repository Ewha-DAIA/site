import { CONFIG } from '../config.js';

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

export default async function Home() {
  let news = [];
  try {
    const newsResponse = await fetch('./data/news.json');
    news = await newsResponse.json();
    news.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Failed to load news:', error);
  }

  let projects = [];
  try {
    const response = await fetch('./data/projects.json');
    projects = await response.json();
  } catch (error) {
    console.error('Failed to load projects:', error);
  }

  const featuredProjects = projects
    .filter(p => p.featured === true)
    .sort((a, b) => {
      const yearA = parseInt(a.period.split(' ')[0]) || 0;
      const yearB = parseInt(b.period.split(' ')[0]) || 0;
      return yearB - yearA;
    })
    .slice(0, 3);

  const formatDate = (dateStr) => {
    const [year, month] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} ${year}`;
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
          <a href="#/research" class="btn btn-primary">Our Research</a>
          <a href="#/people" class="btn btn-secondary">Meet the Team</a>
        </div>
      </div>
      
      <div class="hero-visual">
        <div id="home-visual-slider" class="visual-slider"></div>
        <button class="slider-arrow slider-arrow-left" onclick="sliderPrev()">‹</button>
        <button class="slider-arrow slider-arrow-right" onclick="sliderNext()">›</button>
      </div>
    </section>

    <section class="recruit-banner">
      <div class="recruit-content">
        <h3 class="recruit-title">🚀 DAIA Lab에서 함께 연구할 인재를 찾습니다</h3>
        <p class="recruit-desc">
          데이터와 AI에 열정을 가진 <strong>학부 인턴</strong> 및 <strong>대학원생 (석사/박사)</strong>을 모집합니다.
        </p>
        <a href="mailto:yeop@ewha.ac.kr" class="recruit-apply-btn">Apply →</a>
      </div>
    </section>

    <section class="home-highlights">
      <div class="highlights-container">
        <div class="highlight-section news-section-compact">
          <h2 class="section-title-compact">Latest News</h2>
          <div class="news-list-compact">
            ${news.slice(0, 5).map(item => `
              <div class="news-row-compact">
                <span class="news-date-compact">${formatDate(item.date)}</span>
                <p class="news-content-compact">${item.content}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="highlight-section projects-section-compact">
          <h2 class="section-title-compact">Featured Projects</h2>
          <div class="projects-grid-compact">
            ${featuredProjects.map(project => `
              <a href="#/projects" class="project-card-compact">
                <div class="project-card-image-compact">
                  <img src="${project.image}" alt="${project.title}">
                </div>
                <div class="project-card-info-compact">
                  <h3 class="project-card-title-compact">${project.title}</h3>
                  <p class="project-card-sponsor-compact">${project.sponsor}</p>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}
