import { loadData } from '../../utils/dataLoader.js';

function formatAuthors(text) {
  // Convert **text** to <strong>text</strong>
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

export default async function Patent() {
  const publications = await loadData('publications/patent.json');
  if (!publications) return '<p>Error loading publications data.</p>';

  return `
    <section class="page-content">
      <div class="page-header">
        <h2 class="pub-header-title">등록 특허</h2>
      </div>
      <div id="publications-container" class="publications-wrapper view-compact">
        <div class="pubs-list">
          ${publications.map(pub => `
            <div class="pub-item">
              <div class="pub-id">${pub.id ? `[${pub.id}]` : ''}</div>
              <div class="pub-content">
                <div class="pub-title-author-group">
                  <h3 class="pub-title">
                    ${pub.link && pub.link !== '' && pub.link !== '#'
                      ? `<a href="${pub.link}" target="_blank" rel="noopener noreferrer">${pub.title}</a>` 
                      : pub.title}
                  </h3>
                  <p class="pub-authors">${formatAuthors(pub.authors)}</p>
                </div>
                <div class="pub-tags">
                  ${pub.tags ? pub.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <p class="pub-venue">${pub.venue || ''}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
