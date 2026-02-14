import { loadData } from '../../utils/dataLoader.js';

export default async function Professor() {
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
          <p class="professor-title-main">${person.role}</p>
          <p class="professor-dept-main">${person.department || 'Department of Data Science, Ewha Womans University'}</p>
          
          ${person.contact ? `
            <div class="professor-contact-info">
              ${person.contact.office ? `
                <div class="contact-item">
                  <span class="contact-label">Office</span>
                  <span class="contact-value">${person.contact.office}</span>
                </div>
              ` : ''}
              ${person.contact.tel ? `
                <div class="contact-item">
                  <span class="contact-label">Tel</span>
                  <span class="contact-value">${person.contact.tel}</span>
                </div>
              ` : ''}
              ${person.contact.email ? `
                <div class="contact-item">
                  <span class="contact-label">E-mail</span>
                  <span class="contact-value">${person.contact.email}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}
          
          ${renderSocial(person.social)}
        </div>
      </div>
      
      ${person.sections && person.sections.length > 0 ? `
        <div class="professor-bottom-sections">
          ${person.sections.map(section => `
            <div class="academic-section">
              <h3 class="academic-heading">${section.title}</h3>
              <ul class="academic-list">
                ${section.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  return `
    <section class="page-content">
      <h1 class="page-title">Professor</h1>
      
      <div class="people-sections">
        <!-- Professor Section -->
        <h2 class="section-subtitle pi-subtitle">Principal Investigator</h2>
        <div class="people-section professor-section">
          ${(professors || []).map(person => renderProfessorCard(person)).join('')}
        </div>
      </div>
    </section>
  `;
}
