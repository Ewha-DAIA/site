import { loadData } from '../utils/dataLoader.js';

let cachedProjects = [];
let currentLang = 'ko'; // Default to Korean

export function mount() {
  window.toggleProjectLang = () => {
    currentLang = currentLang === 'ko' ? 'en' : 'ko';
    const langBtn = document.getElementById('project-lang-toggle');
    
    // Update button text
    langBtn.textContent = currentLang === 'ko' ? 'EN' : 'KO';
    
    // Re-render detail view if it's currently shown
    const detailView = document.getElementById('project-detail-view');
    if (detailView && detailView.style.display !== 'none') {
      // Find which project is currently showing
      const currentProjectId = window.__currentProjectId;
      if (currentProjectId) {
        const project = cachedProjects.find(p => p.id === currentProjectId);
        if (project) {
          const detailHTML = renderProjectDetail(project);
          detailView.innerHTML = `
            <button class="back-btn" onclick="hideProjectDetail()">← ${currentLang === 'ko' ? '프로젝트 목록으로' : 'Back to Projects'}</button>
            ${detailHTML}
          `;
        }
      }
    }
    
    // Update grid cards
    const gridCards = document.querySelectorAll('.project-grid-title');
    cachedProjects.forEach((project, index) => {
      if (gridCards[index]) {
        gridCards[index].textContent = currentLang === 'ko' ? project.title_ko : project.title;
      }
    });
  };

  window.showProjectDetail = (id) => {
    const project = cachedProjects.find(p => p.id === id);
    if (!project) return;
    
    window.__currentProjectId = id;
    
    const detailContainer = document.getElementById('project-detail-view');
    const listContainer = document.getElementById('projects-grid-view');
    
    // Render detail content
    const detailHTML = renderProjectDetail(project);
    detailContainer.innerHTML = `
      <button class="back-btn" onclick="hideProjectDetail()">← ${currentLang === 'ko' ? '프로젝트 목록으로' : 'Back to Projects'}</button>
      ${detailHTML}
    `;
    
    listContainer.style.display = 'none';
    detailContainer.style.display = 'block';
    window.scrollTo(0, 0);
    
    // Add to browser history
    window.history.pushState({ view: 'detail', projectId: id }, '', `#/projects/${id}`);
  };

  window.hideProjectDetail = () => {
    document.getElementById('project-detail-view').style.display = 'none';
    document.getElementById('projects-grid-view').style.display = 'grid';
    window.__currentProjectId = null;
    
    // Update history to main projects page
    window.history.pushState({ view: 'list' }, '', '#/projects');
  };
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', (event) => {
    if (window.location.hash.startsWith('#/projects')) {
      if (event.state && event.state.view === 'detail' && event.state.projectId) {
        // Show detail view
        showProjectDetail(event.state.projectId);
      } else {
        // Show list view
        const detailView = document.getElementById('project-detail-view');
        const listView = document.getElementById('projects-grid-view');
        if (detailView && listView) {
          detailView.style.display = 'none';
          listView.style.display = 'grid';
        }
      }
    }
  });
}

function renderProjectDetail(project) {
  const detail = project.detail || {};
  const lang = currentLang;
  
  const title = lang === 'ko' ? project.title_ko : project.title;
  const desc = lang === 'ko' ? project.description_ko : project.description;
  const overview = detail[`overview_${lang}`] || detail.overview;
  const objectives = detail[`objectives_${lang}`] || detail.objectives;
  const approach = detail[`approach_${lang}`] || detail.approach;
  const results = detail[`results_${lang}`] || detail.results;
  const team = detail[`team_${lang}`] || detail.team;
  
  const labels = lang === 'ko' ? {
    overview: '개요',
    objectives: '목표',
    approach: '접근 방법',
    technologies: '기술',
    results: '결과 및 영향',
    team: '팀'
  } : {
    overview: 'Overview',
    objectives: 'Objectives',
    approach: 'Approach',
    technologies: 'Technologies',
    results: 'Results & Impact',
    team: 'Team'
  };
  
  return `
    <div class="detail-content">
      <div class="detail-header">
        <h2 class="detail-title">${title}</h2>
        <p class="detail-meta">
          <span class="detail-sponsor">${project.sponsor}</span> · 
          <span class="detail-period">${project.period}</span> · 
          <span class="detail-status status-${project.status.toLowerCase()}">${project.status}</span>
        </p>
      </div>
      
      <div class="detail-image-wrapper">
        <img src="${project.image}" alt="${title}">
      </div>
      
      <div class="detail-tags">
        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      
      ${overview ? `
        <section class="detail-section">
          <h3 class="detail-section-title">${labels.overview}</h3>
          <p class="detail-text">${overview}</p>
        </section>
      ` : ''}
      
      ${objectives ? `
        <section class="detail-section">
          <h3 class="detail-section-title">${labels.objectives}</h3>
          <ul class="detail-list">
            ${objectives.map(obj => `<li>${obj}</li>`).join('')}
          </ul>
        </section>
      ` : ''}
      
      ${approach ? `
        <section class="detail-section">
          <h3 class="detail-section-title">${labels.approach}</h3>
          <p class="detail-text">${approach}</p>
        </section>
      ` : ''}
      
      ${detail.technologies ? `
        <section class="detail-section">
          <h3 class="detail-section-title">${labels.technologies}</h3>
          <ul class="detail-tech-list">
            ${detail.technologies.map(tech => `<li>${tech}</li>`).join('')}
          </ul>
        </section>
      ` : ''}
      
      ${results ? `
        <section class="detail-section">
          <h3 class="detail-section-title">${labels.results}</h3>
          <ul class="detail-list">
            ${results.map(result => `<li>${result}</li>`).join('')}
          </ul>
        </section>
      ` : ''}
      
      ${team ? `
        <section class="detail-section">
          <h3 class="detail-section-title">${labels.team}</h3>
          <ul class="detail-team-list">
            ${team.map(member => `<li>${member}</li>`).join('')}
          </ul>
        </section>
      ` : ''}
      
      ${!overview && !objectives ? `
        <section class="detail-section">
          <p class="detail-text">${desc || project.description}</p>
        </section>
      ` : ''}
    </div>
  `;
}

export default async function Projects() {
  cachedProjects = await loadData('projects.json');
  if (!cachedProjects) return '<p>Error loading projects data.</p>';

  return `
    <section class="page-content">
      <div class="page-header">
        <h1 class="page-title">프로젝트</h1>
        <button id="project-lang-toggle" class="lang-toggle-btn" onclick="toggleProjectLang()">EN</button>
      </div>
      
      <!-- Grid View -->
      <div id="projects-grid-view" class="projects-grid">
        ${cachedProjects.map(project => `
          <div class="project-card-grid" onclick="showProjectDetail(${project.id})">
            <div class="project-grid-image">
              <img src="${project.image}" alt="${project.title_ko}">
            </div>
            <div class="project-grid-info">
              <h3 class="project-grid-title">${project.title_ko}</h3>
              <p class="project-grid-agency">${project.sponsor}</p>
              <div class="project-tags">
                ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Detail View (Hidden by default) -->
      <div id="project-detail-view" class="project-detail" style="display: none;"></div>
    </section>
  `;
}
