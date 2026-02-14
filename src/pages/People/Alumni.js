import { loadData } from '../../utils/dataLoader.js';

export default async function Alumni() {
  const people = await loadData('people/alumni.json');
  if (!people) return '<p>Error loading people data.</p>';

  const alumni = people;

  // Helper to generate social icons
  const renderSocial = (social) => {
    if (!social) return '';
    let html = '<div class="member-social">';
    if (social.cv) html += `<a href="${social.cv}" target="_blank" title="CV"><img src="./assets/imoticon/cv.png" alt="CV"></a>`;
    if (social.github) html += `<a href="${social.github}" target="_blank" title="GitHub"><img src="./assets/imoticon/github.png" alt="GitHub"></a>`;
    if (social.linkedin) html += `<a href="${social.linkedin}" target="_blank" title="LinkedIn"><img src="./assets/imoticon/linkedin.png" alt="LinkedIn"></a>`;
    if (social.scholar) html += `<a href="${social.scholar}" target="_blank" title="Google Scholar"><img src="./assets/imoticon/scholar.png" alt="Scholar"></a>`;
    html += '</div>';
    return html;
  };

  // Modal Logic (Inline)
  window.openMemberModal = (id) => {
    const person = people.find(p => p.id === id);
    if (!person) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        <div class="modal-body">
          <div class="modal-image">
            <img src="${person.image}" alt="${person.name}">
          </div>
          <div class="modal-info">
            <h2>${person.name}</h2>
            <p class="modal-role">${person.role}</p>
            <p class="modal-bio">${person.bio}</p>
            ${renderSocial(person.social)}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  };

  return `
    <section class="page-content">
      <h1 class="page-title">Alumni</h1>
      <br>
      <div class="people-groups">
        ${alumni.length > 0 ? `
          <div class="people-group">
            <div class="people-grid">
              ${alumni.map(person => `
                <div class="person-card">
                  <button class="person-more-btn" onclick="openMemberModal(${person.id})" title="View Details">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="5" cy="12" r="2"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                      <circle cx="19" cy="12" r="2"></circle>
                    </svg>
                  </button>
                  <div class="person-image">
                    <img src="${person.image}" alt="${person.name}">
                  </div>
                  <div class="person-info">
                    <h3 class="person-name">${person.name}</h3>
                    <p class="person-role">${person.role}</p>
                    ${person.social && person.social.email ? `<p class="person-email">${person.social.email}</p>` : ''}
                    ${renderSocial(person.social)}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : '<p style="text-align:center; padding: 2rem; color: var(--text-secondary);">No alumni yet.</p>'}
      </div>
    </section>
  `;
}
