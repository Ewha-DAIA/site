import Header, { mountHeader } from './components/Header.js?v=4';
import { getLang, setLang } from './utils/lang.js?v=3';

// Pages that have both Korean and English content show the language switch
const BILINGUAL = new Set(['/', '/research', '/projects', '/people/professor', '/join']);
import Footer from './components/Footer.js';

const routes = {
  '/': () => import('./pages/Home.js?v=13'),
  '/people': () => {
    // Redirect to professor by default
    window.location.hash = '#/people/professor';
    return import('./pages/People/Professor.js?v=7');
  },
  '/people/professor': () => import('./pages/People/Professor.js?v=7'),
  '/people/members': () => import('./pages/People/Members.js?v=3'),
  '/people/alumni': () => import('./pages/People/Alumni.js'),
  '/research': () => import('./pages/Research.js?v=43'),
  '/publications': () => {
    // Redirect to international by default
    window.location.hash = '#/publications/international';
    return import('./pages/Publications/International.js');
  },
  '/publications/international': () => import('./pages/Publications/International.js'),
  '/publications/domestic': () => import('./pages/Publications/Domestic.js'),
  '/publications/patent': () => import('./pages/Publications/Patent.js'),
  '/teaching': () => import('./pages/Teaching.js?v=5'),
  '/gallery': () => import('./pages/Gallery.js?v=3'),
  '/contact': () => import('./pages/Contact.js?v=6'),
  '/join': () => import('./pages/Join.js?v=18'),
  '/projects': () => import('./pages/Projects.js?v=15'),
};

const app = document.getElementById('app');
const headerContainer = document.getElementById('main-header');
const footerContainer = document.getElementById('main-footer');
const mainContent = document.getElementById('main-content');

// Put the 한국어/EN switch at the top right of the page (next to the title when there is one)
function updateLangSwitch(path) {
  if (!BILINGUAL.has(path)) return;
  const lang = getLang();
  const box = document.createElement('div');
  box.className = 'page-lang';
  box.innerHTML = `
    <button class="page-lang-btn ${lang === 'ko' ? 'active' : ''}" onclick="switchLang('ko')">한국어</button>
    <button class="page-lang-btn ${lang === 'en' ? 'active' : ''}" onclick="switchLang('en')">EN</button>`;
  const header = mainContent.querySelector('.ra-page-header');
  if (header) {
    header.appendChild(box);
  } else {
    box.classList.add('page-lang-floating');
    mainContent.prepend(box);
  }
}

// Re-render the current page in the chosen language, keeping the scroll position
window.switchLang = (lang) => {
  setLang(lang);
  renderPage({ keepScroll: true });
};

async function renderPage({ keepScroll = false } = {}) {
  const path = window.location.hash.slice(1) || '/';
  const loadPage = routes[path] || routes['/'];
  const scrollY = window.scrollY;

  try {
    const module = await loadPage();
    const PageComponent = module.default;
    mainContent.innerHTML = await PageComponent();
    updateLangSwitch(path);
    window.scrollTo(0, keepScroll ? scrollY : 0);
    if (module.mount) {
      setTimeout(() => module.mount(), 0);
    }
    // Setup animations after page render
    setTimeout(setupAnimations, 100);
  } catch (error) {
    console.error('Error loading page:', error);
    mainContent.innerHTML = '<h1>404 - Page Not Found</h1>';
  }
}

async function init() {
  headerContainer.innerHTML = Header();
  mountHeader();
  footerContainer.innerHTML = Footer();

  window.addEventListener('hashchange', () => renderPage());
  await renderPage();
}

function setupAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  const elements = document.querySelectorAll('.hero-content, .person-card, .ra-card, .pub-item, .course-item, .gallery-item, .contact-info, .contact-map, .recruit-banner');
  elements.forEach(el => observer.observe(el));
}

init();
