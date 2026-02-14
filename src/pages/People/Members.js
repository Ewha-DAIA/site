import { loadData } from '../../utils/dataLoader.js';

export default async function Members() {
  // Load students data
  const students = await loadData('people/students.json');
  
  if (!students) return '<p>Error loading people data.</p>';

  const allPeople = [...(students || [])];

  // Group students by role
  const phdStudents = (students || []).filter(p => p.role === 'Ph.D. Student');
  const mastersStudents = (students || []).filter(p => p.role === 'Master Student');
  const undergraduates = (students || []).filter(p => p.role === 'Undergraduate Student');

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

  // Modal Logic
  window.openMemberModal = (id) => {
    const person = allPeople.find(p => p.id === id);
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

  // Render student card (clickable)
  const renderStudentCard = (person) => `
    <div class="person-card clickable" onclick="openMemberModal(${person.id})">
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
  `;

  // Render student section
  const renderStudentSection = (title, students) => {
    if (!students || students.length === 0) return '';
    return `
      <div class="people-section">
        <h2 class="section-subtitle">${title}</h2>
        <div class="people-grid">
          ${students.map(person => renderStudentCard(person)).join('')}
        </div>
      </div>
    `;
  };

  return `
    <section class="page-content">
      <h1 class="page-title">Members</h1>
      
      <div class="people-sections">
        <!-- Students Sections -->
        ${renderStudentSection('Ph.D. Students', phdStudents)}
        ${renderStudentSection('Master Students', mastersStudents)}
        ${renderStudentSection('Undergraduate Students', undergraduates)}
      </div>
    </section>
  `;
}
