import { loadData } from '../utils/dataLoader.js';

let currentLang = 'ko';

export function mount() {
  window.toggleResearchLang = (lang) => {
    currentLang = lang;
    const koBtn = document.getElementById('research-lang-ko');
    const enBtn = document.getElementById('research-lang-en');
    const titles = document.querySelectorAll('.ra-title');
    const descs = document.querySelectorAll('.ra-description');

    koBtn.classList.toggle('active', lang === 'ko');
    enBtn.classList.toggle('active', lang === 'en');

    const researchData = window.__researchData || [];
    researchData.forEach((item, index) => {
      if (titles[index]) {
        titles[index].textContent = lang === 'ko' ? item.title_ko : item.title;
      }
      if (descs[index]) {
        descs[index].textContent = lang === 'ko' ? item.description_ko : item.description;
      }
    });
  };
}

export default async function Research() {
  const research = await loadData('research.json');
  if (!research) return '<p>Error loading research data.</p>';

  window.__researchData = research;

  return `
    <section class="page-content">
      <div class="ra-page-header">
        <div>
          <h1 class="page-title">연구 분야</h1>
          <p class="ra-page-subtitle">Research Areas</p>
        </div>
        <div class="ra-lang-toggle">
          <button id="research-lang-ko" class="lang-btn active" onclick="toggleResearchLang('ko')">한국어</button>
          <button id="research-lang-en" class="lang-btn" onclick="toggleResearchLang('en')">English</button>
        </div>
      </div>

      <div class="ra-grid">
        ${research.map(item => `
          <div class="ra-card">
            <div class="ra-icon">${item.icon}</div>
            <h3 class="ra-title">${item.title_ko}</h3>
            <p class="ra-description">${item.description_ko}</p>
            <div class="ra-keywords">
              ${item.keywords.map(k => `<span class="ra-keyword">${k}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}
