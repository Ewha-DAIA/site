import { loadData } from '../utils/dataLoader.js';
import { getLang, setLang, pick, langToggle } from '../utils/lang.js?v=3';

export function mount() {
  window.toggleProjectLang = async (lang) => {
    setLang(lang);
    document.getElementById('main-content').innerHTML = await Projects();
  };
}

const renderLogos = (project, lang, cls) => (project.logos || []).length
  ? project.logos.map(src => `<img class="${cls}" src="${src}" alt="${pick(project, 'sponsor', lang)}">`).join('')
  : '';

const renderCurrent = (project, lang) => `
  <div class="pj-card">
    <div class="pj-logo">
      ${renderLogos(project, lang, 'pj-logo-img') || `<span>${pick(project, 'sponsor', lang)}</span>`}
    </div>
    <div class="pj-info">
      <div class="pj-badges">
        ${project.ongoing
          ? `<span class="pj-badge pj-badge-live">${lang === 'ko' ? '진행 중' : 'Ongoing'}</span>`
          : `<span class="pj-badge pj-badge-done">${lang === 'ko' ? '완료' : 'Completed'}</span>`}
        ${pick(project, 'role', lang) ? `<span class="pj-badge">${pick(project, 'role', lang)}</span>` : ''}
      </div>
      <h3 class="pj-title">${pick(project, 'title', lang)}</h3>
      <p class="pj-meta">${pick(project, 'sponsor', lang)}${project.period ? ` · ${project.period}` : ''}</p>
    </div>
  </div>
`;

// Earlier projects: date | title (+ sponsor, role only when PI) | logo
const renderPast = (project, lang) => `
  <li class="pj-row">
    <span class="pj-row-period">${project.period}</span>
    <div>
      <p class="pj-row-title">${pick(project, 'title', lang)}
        ${pick(project, 'role', lang) ? `<span class="pj-badge">${pick(project, 'role', lang)}</span>` : ''}
      </p>
      <p class="pj-meta">${pick(project, 'sponsor', lang)}</p>
    </div>
    <div class="pj-row-logo">${renderLogos(project, lang, '')}</div>
  </li>
`;

export default async function Projects() {
  const projects = await loadData('projects.json');
  if (!projects) return '<p>Error loading projects data.</p>';
  const lang = getLang();
  const ko = lang === 'ko';
  const ongoing = projects.filter(p => p.era === 'ewha' && p.ongoing);
  const completed = projects.filter(p => p.era === 'ewha' && !p.ongoing);
  const past = projects.filter(p => p.era !== 'ewha');

  return `
    <section class="page-content">
      <div class="ra-page-header">
        <h1 class="page-title">${ko ? '프로젝트' : 'Projects'}</h1>
        ${langToggle('toggleProjectLang', lang)}
      </div>

      <div class="pj-container">
        <h2 class="rs-section-title">${ko ? 'DAIA Lab 프로젝트' : 'DAIA Lab Projects'}</h2>
        <p class="rs-section-subtitle">${ko ? '이화여자대학교, 2026 –' : 'Ewha Womans University, 2026 –'}</p>
        <h3 class="pj-subhead">${ko ? '진행 중' : 'Ongoing'}</h3>
        <div class="pj-grid">${ongoing.map(p => renderCurrent(p, lang)).join('')}</div>
        ${completed.length ? `
          <h3 class="pj-subhead">${ko ? '완료' : 'Completed'}</h3>
          <div class="pj-grid pj-grid-done">${completed.map(p => renderCurrent(p, lang)).join('')}</div>
        ` : ''}

        <section class="pj-past">
          <h2 class="rs-section-title">${ko ? '이화여대 합류 이전' : 'Before Ewha'}</h2>
          <ul class="pj-list">${past.map(p => renderPast(p, lang)).join('')}</ul>
        </section>
      </div>
    </section>
  `;
}
