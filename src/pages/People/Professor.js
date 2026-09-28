import { loadData } from '../../utils/dataLoader.js';
import { getLang, setLang, pick, langToggle } from '../../utils/lang.js?v=3';

export function mount() {
  window.toggleProfessorLang = async (lang) => {
    setLang(lang);
    document.getElementById('main-content').innerHTML = await Professor();
  };
}

export default async function Professor() {
  const lang = getLang();
  const ko = lang === 'ko';
  // Load professor data
  const professors = await loadData('people/professor.json');
  
  if (!professors) return '<p>Error loading professor data.</p>';

  // Helper to generate social icons
  const renderSocial = (social) => {
    if (!social) return '';
    let html = '<div class="member-social">';
    if (social.cv) html += `<a href="${social.cv}" target="_blank" title="CV" onclick="event.stopPropagation()"><img src="./assets/imoticon/cv.png" alt="CV"></a>`;
    if (social.github) html += `<a href="${social.github}" target="_blank" title="GitHub" onclick="event.stopPropagation()"><img src="./assets/imoticon/github.png" alt="GitHub"></a>`;
    if (social.linkedin) html += `<a href="${social.linkedin}" target="_blank" title="LinkedIn" onclick="event.stopPropagation()"><img src="./assets/imoticon/linkedin.png" alt="LinkedIn"></a>`;
    if (social.scholar) html += `<a href="${social.scholar}" target="_blank" title="Google Scholar" onclick="event.stopPropagation()"><img src="./assets/imoticon/scholar.png" alt="Scholar"></a>`;
    html += '</div>';
    return html;
  };

  // Render professor card with data-driven sections
  const renderProfessorCard = (person) => `
    <div class="professor-card-new">
      <div class="professor-top-section">
        <div class="professor-image-left">
          <img src="${person.image}" alt="${person.name}">
        </div>
        
        <div class="professor-basic-details">
          <h2 class="professor-name-main">${person.name}</h2>
          <p class="professor-title-main">${pick(person, 'role', lang)}</p>
          <p class="professor-dept-main">${pick(person, 'department', lang)}</p>
          
          ${person.contact ? `
            <div class="professor-contact-info">
              ${person.contact.office ? `
                <div class="contact-item">
                  <span class="contact-label">${ko ? '연구실' : 'Office'}</span>
                  <span class="contact-value">${pick(person.contact, 'office', lang)}</span>
                </div>
              ` : ''}
              ${person.contact.tel ? `
                <div class="contact-item">
                  <span class="contact-label">${ko ? '전화' : 'Tel'}</span>
                  <span class="contact-value">${person.contact.tel}</span>
                </div>
              ` : ''}
              ${person.contact.email ? `
                <div class="contact-item">
                  <span class="contact-label">${ko ? '이메일' : 'E-mail'}</span>
                  <span class="contact-value">${person.contact.email}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}
          
          ${renderSocial(person.social)}
        </div>
      </div>
      
      ${person.bio ? `<div class="professor-bio">${pick(person, 'bio', lang).split('\n\n').map(para => `<p>${para}</p>`).join('')}</div>` : ''}

      ${person.sections && person.sections.length > 0 ? `
        <div class="professor-bottom-sections">
          ${person.sections.map(section => `
            <div class="academic-section">
              <h3 class="academic-heading">${pick(section, 'title', lang)}</h3>
              <ul class="academic-list">
                ${pick(section, 'items', lang).map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  return `
    <section class="page-content">
      <div class="ra-page-header">
        <h1 class="page-title">${ko ? '교수' : 'Professor'}</h1>
      </div>
      
      <div class="people-sections">
        <!-- Professor Section -->
        <h2 class="section-subtitle pi-subtitle">${ko ? '연구책임자' : 'Principal Investigator'}</h2>
        <div class="people-section professor-section">
          ${(professors || []).map(person => renderProfessorCard(person)).join('')}
        </div>
      </div>
    </section>
  `;
}
