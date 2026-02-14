import { loadData } from '../../utils/dataLoader.js';

// Helper function to convert * and † to superscript, and **name** to bold
function formatAuthors(authors) {
  if (!authors) return '';
  return authors
    .replace(/\n/g, '<br>')
    .replace(/\\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*/g, '<sup>*</sup>')
    .replace(/†/g, '<sup>†</sup>');
}

// Badge color map
const BADGE_COLORS = {
  'SCIE': { bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
  'SSCI': { bg: '#fce7f3', color: '#be185d', border: '#f9a8d4' },
  '최우수': { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  '우수': { bg: '#fff7ed', color: '#ea580c', border: '#fdba74' },
};

function getDefaultBadgeStyle() {
  return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
}

function renderBadges(badges) {
  if (!badges || badges.length === 0) return '';
  return `<div class="pub-badges">
    ${badges.map(badge => {
      const style = BADGE_COLORS[badge] || getDefaultBadgeStyle();
      return `<span class="pub-badge" style="background:${style.bg};color:${style.color};border:1px solid ${style.border};">${badge}</span>`;
    }).join('')}
  </div>`;
}

export default async function International() {
  const publications = await loadData('publications/international.json');
  if (!publications) return '<p>Error loading publications data.</p>';

  // Group by Year
  const grouped = publications.reduce((acc, pub) => {
    const year = pub.year || "Unknown";
    if (!acc[year]) acc[year] = [];
    acc[year].push(pub);
    return acc;
  }, {});

  // Sort years: "Under Review" first, then descending
  const sortedYears = Object.keys(grouped).sort((a, b) => {
    if (a === "Under Review") return -1;
    if (b === "Under Review") return 1;
    return b - a;
  });

  return `
    <section class="page-content">
      <div class="page-header">
        <h2 class="pub-header-title">Publications - International</h2>
      </div>

      <div class="pub-author-legend">
        <span class="legend-item"><span class="legend-symbol">*</span> Equal contribution</span>
        <span class="legend-item"><span class="legend-symbol">†</span> Corresponding author</span>
        <span class="legend-divider">|</span>
        <span class="legend-item legend-note">우수/최우수: 한국정보과학회 기준</span>
      </div>

      <div id="publications-container" class="publications-wrapper view-compact">
        ${sortedYears.map(year => `
          <div class="year-group">
            <h2 class="year-title">${year}</h2>
            <div class="pubs-list">
              ${grouped[year].map(pub => `
                <div class="pub-item">
                  <div class="pub-id">${pub.id ? `[${pub.id}]` : ''}</div>
                  <div class="pub-image">
                    <img src="${pub.image}" alt="${pub.title}">
                  </div>
                  <div class="pub-content">
                    <div class="pub-title-author-group">
                      <h3 class="pub-title">
                        ${pub.link && pub.link !== '#' 
                          ? `<a href="${pub.link}" target="_blank" rel="noopener noreferrer">${pub.title.replace(/\n/g, '<br>').replace(/\\n/g, '<br>')}</a>` 
                          : pub.title.replace(/\n/g, '<br>').replace(/\\n/g, '<br>')}
                      </h3>
                      <p class="pub-authors">${formatAuthors(pub.authors)}</p>
                    </div>
                    <div class="pub-tags">
                      ${pub.tags ? pub.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                    <div class="pub-venue-group">
                      <p class="pub-venue">${pub.venue ? pub.venue.replace(/\n/g, '<br>').replace(/\\n/g, '<br>') : ''}</p>
                      ${renderBadges(pub.badges)}
                    </div>
                    <div class="pub-links">
                      ${pub.pdf ? `<a href="${pub.pdf}" target="_blank">PDF</a>` : ''}
                      ${pub.code ? `<a href="${pub.code}" target="_blank">Code</a>` : ''}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}
