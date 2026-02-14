import { loadData } from '../utils/dataLoader.js';

export default async function Gallery() {
  const gallery = await loadData('gallery.json');
  if (!gallery) return '<p>Error loading gallery data.</p>';

  // Group by Year-Semester
  const grouped = gallery.reduce((acc, item) => {
    const key = `${item.year} ${item.semester}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // Modal function
  window.openImageModal = (imageSrc, title) => {
    const modal = document.createElement('div');
    modal.className = 'image-modal-overlay';
    modal.innerHTML = `
      <div class="image-modal-content">
        <button class="image-modal-close" onclick="this.closest('.image-modal-overlay').remove()">×</button>
        <img src="${imageSrc}" alt="${title}">
        ${title ? `<p class="image-modal-caption">${title}</p>` : ''}
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
      <h1 class="page-title">Gallery</h1>
      <div class="gallery-groups">
        ${Object.entries(grouped).map(([groupName, items]) => `
          <div class="gallery-group">
            <h2 class="group-title">${groupName}</h2>
            <div class="gallery-container">
              <div class="gallery-scroll">
                ${items.map(item => `
                  <div class="gallery-item" onclick="openImageModal('${item.image}', '${item.title}')">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="gallery-caption">${item.title}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}
