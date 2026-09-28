import { loadData } from '../utils/dataLoader.js';
import { getLang } from '../utils/lang.js?v=3';

// English uses the `_en` field when present, otherwise the Korean base field
const tr = (obj, key) => (getLang() === 'en' && obj[`${key}_en`] !== undefined) ? obj[`${key}_en`] : obj[key];
const en = () => getLang() === 'en';

export function mount() {
  window.showJoinTab = (index) => {
    document.querySelectorAll('.join-tab').forEach((tab, i) => tab.classList.toggle('active', i === index));
    document.querySelectorAll('.join-panel').forEach((panel, i) => { panel.hidden = i !== index; });
  };
}

const TRACK_LABEL = { applied: ['응용 연구', 'Applied'], core: ['코어 AI', 'Core AI'] };

// One topic row: track/domain tag on the left, title, description, and optional links
const renderTopic = (topic) => `
  <div class="join-topic">
    <div class="join-topic-tags">
      <span class="join-track-tag join-track-${topic.track}">${(TRACK_LABEL[topic.track] || ['', ''])[en() ? 1 : 0]}</span>
      ${topic.domain ? `<span class="join-topic-domain">${tr(topic, 'domain')}</span>` : ''}
    </div>
    <div>
      <p class="join-topic-title">${en() ? topic.title_en : (topic.title_ko || topic.title)}</p>
      <p class="join-topic-desc">${tr(topic, 'description')}</p>
      ${(topic.links || []).map(link => link.url
        ? `<a class="join-topic-link" href="${link.url}" target="_blank" rel="noopener">${tr(link, 'label')} ↗</a>`
        : `<span class="join-topic-link join-topic-link-muted">${tr(link, 'label')}</span>`).join('')}
    </div>
  </div>
`;

export default async function Join() {
  const join = await loadData('join.json');
  const topics = (await loadData('topics.json')) || {};
  const research = (await loadData('research.json')) || {};
  const pubs = Object.fromEntries(((await loadData('publications/international.json')) || []).map(x => [x.id, x]));
  const logos = Object.entries(research.partner_logos || {});
  if (!join) return '<p>Error loading join data.</p>';

  const ongoing = topics.ongoing || [];
  const recruiting = topics.recruiting || [];
  const rt = join.research_tracks;

  return `
    <section class="page-content">
      <div class="ra-page-header">
        <div>
          <h1 class="page-title">${en() ? 'Join Us' : '연구원 모집'}</h1>
        </div>
      </div>

      <div class="join-container">
        <p class="join-intro">${tr(join, 'intro')}</p>

        ${rt ? `
          <section class="join-section">
            <h2 class="rs-section-title">${tr(rt, 'title')}</h2>
            <p class="rs-section-subtitle">${tr(rt, 'subtitle')}</p>
            <div class="join-research-tracks">
              ${rt.tracks.map(track => `
                <div class="join-rtrack join-rtrack-${track.id}">
                  <span class="join-track-tag join-track-${track.id}">${tr(track, 'title')}</span>
                  <h3 class="rs-card-title">${tr(track, 'who')}</h3>
                  <p class="join-topic-desc">${tr(track, 'text')}</p>
                  ${track.keywords ? `<p class="join-keywords-plain">${tr(track, 'keywords').join(' · ')}</p>` : ''}
                  ${track.show_partners ? `
                    <div class="join-partners">
                      ${logos.map(([name, logo]) => `<span class="rs-partner" title="${name}">${logo ? `<img src="${logo}" alt="${name}">` : name}</span>`).join('')}
                    </div>
                    <p class="join-note">${track.partners_note}</p>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <section class="join-section">
          <h2 class="rs-section-title">${en() ? 'Who We Are Looking For' : '모집 대상'}</h2>
          <div class="join-tabs" role="tablist">
            ${join.tracks.map((track, i) => `
              <button class="join-tab ${i === 0 ? 'active' : ''}" role="tab" onclick="showJoinTab(${i})">${tr(track, 'title')}</button>
            `).join('')}
          </div>
          ${join.tracks.map((track, i) => `
            <div class="join-panel" data-panel="${i}" ${i === 0 ? '' : 'hidden'}>
              <p class="join-who">${tr(track, 'who')}</p>
              <ul class="join-list">
                ${tr(track, 'items').map(item => `<li>${item}</li>`).join('')}
              </ul>
              ${track.papers ? `
                <p class="join-papers-title">${tr(track, 'papers_title')}</p>
                <div class="join-papers">
                  ${track.papers.map(id => pubs[id]).filter(Boolean).map(pb => {
                    const venue = (pb.venue || '').split('\n')[0] || (en() ? 'Under review' : '심사 중');
                    const label = `${pb.title.split(':')[0]} <span>${venue}</span>`;
                    return pb.link ? `<a class="join-paper" href="${pb.link}" target="_blank" rel="noopener" title="${pb.title}">${label}</a>` : `<span class="join-paper" title="${pb.title}">${label}</span>`;
                  }).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </section>

        ${ongoing.length ? `
          <section class="join-section">
            <h2 class="rs-section-title">${en() ? 'Ongoing Research' : '진행 중인 연구'}</h2>
            <p class="rs-section-subtitle">${en() ? 'Research the lab is working on now. You are welcome to join if it interests you.' : '연구실에서 지금 진행하고 있는 연구입니다. 관심 있다면 함께 참여할 수 있습니다.'}</p>
            <div class="join-topics">${ongoing.map(renderTopic).join('')}</div>
          </section>
        ` : ''}

        ${recruiting.length ? `
          <section class="join-section">
            <h2 class="rs-section-title">${en() ? 'Open Topics' : '모집 중인 연구 주제'}</h2>
            <p class="rs-section-subtitle">${en() ? 'New topics looking for students. You are also welcome to propose your own.' : '새로 시작하는 주제로, 함께할 학생을 찾고 있습니다. 관심 있는 주제를 직접 제안해도 좋습니다.'}</p>
            <div class="join-topics">${recruiting.map(renderTopic).join('')}</div>
          </section>
        ` : ''}

        <section class="join-section">
          <h2 class="rs-section-title">${en() ? 'Request a Meeting' : '면담 신청'}</h2>
          <p class="rs-section-subtitle">${tr(join.contact, 'note')}</p>
          <a href="mailto:${join.contact.email}?subject=${encodeURIComponent('[DAIA 면담] ')}" class="recruit-apply-btn">${en() ? 'Email us' : '메일로 면담 신청하기'}</a>
        </section>
      </div>
    </section>
  `;
}
