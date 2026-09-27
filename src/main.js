import Header, { mountHeader } from './components/Header.js?v=2';
import Footer from './components/Footer.js';

const routes = {
  '/': () => import('./pages/Home.js?v=12'),
  '/people': () => {
    // Redirect to professor by default
    window.location.hash = '#/people/professor';
    return import('./pages/People/Professor.js?v=6');
  },
  '/people/professor': () => import('./pages/People/Professor.js?v=6'),
  '/people/members': () => import('./pages/People/Members.js?v=3'),
  '/people/alumni': () => import('./pages/People/Alumni.js'),
  '/research': () => import('./pages/Research.js?v=41'),
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
  '/join': () => import('./pages/Join.js?v=16'),
  '/projects': () => import('./pages/Projects.js?v=14'),
};

const app = document.getElementById('app');
const headerContainer = document.getElementById('main-header');
const footerContainer = document.getElementById('main-footer');
const mainContent = document.getElementById('main-content');

async function renderPage() {
  const path = window.location.hash.slice(1) || '/';
  const loadPage = routes[path] || routes['/'];

  try {
    const module = await loadPage();
    const PageComponent = module.default;
    mainContent.innerHTML = await PageComponent();
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

  window.addEventListener('hashchange', renderPage);
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
