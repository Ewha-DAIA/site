import { loadData } from '../utils/dataLoader.js';
import { getLang, setLang, pick, langToggle } from '../utils/lang.js?v=3';

let data = null;
let papersById = {};
let nodes = {};        // id -> { kind, item, links }
let selectedId = null;

const t = (obj, key) => pick(obj, key);
const ko = () => getLang() === 'ko';

// ---------- Tree layout ----------

const W = 900;
const H = 950;
const COL_X = { center: 95, tech: 370, domain: 665 };
const TOP = 120;
const BOTTOM = 840;
const TRUST_X = 800;

const spread = (i, n) => TOP + i * ((BOTTOM - TOP) / Math.max(n - 1, 1));

function layout() {
  const pos = { center: { x: COL_X.center, y: (TOP + BOTTOM) / 2 } };
  data.techniques.forEach((tech, i) => { pos[tech.id] = { x: COL_X.tech, y: spread(i, data.techniques.length) }; });
  data.domains.forEach((d, i) => { pos[d.id] = { x: COL_X.domain, y: spread(i, data.domains.length) }; });
  return pos;
}

const edgePath = (a, b) => {
  const mx = (a.x + b.x) / 2;
  return `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
};

function buildGraph() {
  nodes = {
    center: { kind: 'center', item: data.center, links: new Set() },
    safety: { kind: 'safety', item: data.safety, links: new Set() },
  };
  data.techniques.forEach(tech => {
    nodes[tech.id] = { kind: 'tech', item: tech, links: new Set(['center']) };
    nodes.center.links.add(tech.id);
  });
  data.domains.forEach(d => { nodes[d.id] = { kind: 'domain', item: d, links: new Set() }; });
  nodes.core = { kind: 'core', item: data.core_research, links: new Set(data.techniques.map(x => x.id)) };
  nodes.applied = { kind: 'applied', item: data.applied_research, links: new Set(data.domains.map(x => x.id)) };
  // Trust applies to everything, so it links to every node
  [...data.techniques, ...data.domains].forEach(x => nodes.safety.links.add(x.id));
  data.techniques.forEach(tech => tech.domains.forEach(did => {
    if (!nodes[did]) return;
    nodes[tech.id].links.add(did);
    nodes[did].links.add(tech.id);
  }));
}

function edgeList() {
  const list = data.techniques.map(tech => ({ a: 'center', b: tech.id }));
  data.techniques.forEach(tech => tech.domains.forEach(did => list.push({ a: tech.id, b: did })));
  return list;
}

// ---------- SVG ----------

// Rounded-rectangle node body, centred on the node origin
// A hidden copy behind it is used for the small "click me" pulse
const nodeBox = (bw, bh) => `
  <rect class="rm-node-pulse" x="${-bw / 2}" y="${-bh / 2}" width="${bw}" height="${bh}" rx="14"/>
  <rect class="rm-dot" x="${-bw / 2}" y="${-bh / 2}" width="${bw}" height="${bh}" rx="14"/>`;

// Shrink the font for long labels so they stay inside the box
const fitFont = (lines, base, maxChars) => (Math.max(...lines.map(l => l.length)) > maxChars ? base - 1.5 : base);

function nodeLabel(lines, fontSize) {
  const lh = fontSize * 1.2;
  const top = -((lines.length - 1) * lh) / 2;
  return lines.map((line, i) => `<text class="rm-label" y="${top + i * lh}" dy="0.35em" font-size="${fontSize}">${line}</text>`).join('');
}

// ---------- Radial layout ----------
// Same nodes, links, and ids as the tree, arranged in rings:
// problem solving in the centre, core AI on the inner ring, applied research on
// the outer ring, and trust as the outermost ring around everything.

const R_SIZE = 900;
const RC = { x: 450, y: 450 };
const RING = { tech: 185, domain: 330, trust: 418 };

function layoutRadial() {
  const pos = { center: RC };
  const at = (r, i, n, offsetDeg) => {
    const a = ((i / n) * 360 - 90 + offsetDeg) * Math.PI / 180;
    return { x: RC.x + r * Math.cos(a), y: RC.y + r * Math.sin(a) };
  };
  // Offsets keep the top of each ring free for its label
  // Ring order differs slightly from the tree: optimization and multimodal swap places
  const ring = data.techniques.map(tc => tc.id);
  const a = ring.indexOf('opt'), b = ring.indexOf('mm');
  if (a >= 0 && b >= 0) [ring[a], ring[b]] = [ring[b], ring[a]];
  ring.forEach((id, i) => { pos[id] = at(RING.tech, i, ring.length, 180 / ring.length); });
  data.domains.forEach((d, i) => { pos[d.id] = at(RING.domain, i, data.domains.length, 180 / data.domains.length); });
  return pos;
}

const radialEdge = (a, b) => {
  if (a.x === RC.x && a.y === RC.y) return `M${a.x},${a.y} L${b.x},${b.y}`;
  const mx = RC.x + ((a.x + b.x) / 2 - RC.x) * 1.12;
  const my = RC.y + ((a.y + b.y) / 2 - RC.y) * 1.12;
  return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
};

function renderMapRadial() {
  const pos = layoutRadial();
  const tr = RING.trust;
  return `
    <svg class="rm-svg rm-radial" viewBox="0 0 ${R_SIZE} ${R_SIZE}" role="img" aria-label="${t(data, 'map_title')}">
      <defs>
        <radialGradient id="rm-center-grad" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#10B981"/><stop offset="100%" stop-color="#00462A"/>
        </radialGradient>
        <path id="rm-trust-path" d="M ${RC.x - tr},${RC.y} a ${tr},${tr} 0 1,1 ${tr * 2},0 a ${tr},${tr} 0 1,1 ${-tr * 2},0"/>
      </defs>

      <circle class="rm-trust-field" cx="${RC.x}" cy="${RC.y}" r="${tr}"/>
      <g class="rm-safety" data-id="safety" tabindex="0">
        <circle class="rm-safety-ring" cx="${RC.x}" cy="${RC.y}" r="${tr}"/>
        <circle class="rm-safety-hit" cx="${RC.x}" cy="${RC.y}" r="${tr}"/>
        <text class="rm-safety-text"><textPath href="#rm-trust-path" startOffset="25%" text-anchor="middle">${t(data.safety, 'ring_label')}</textPath></text>
      </g>

      <g class="rm-core rm-applied" data-id="applied" tabindex="0">
        <circle class="rm-ring-band" cx="${RC.x}" cy="${RC.y}" r="${RING.domain}" stroke-width="96"/>
        <circle class="rm-ring-edge" cx="${RC.x}" cy="${RC.y}" r="${RING.domain - 48}"/>
        <circle class="rm-ring-edge" cx="${RC.x}" cy="${RC.y}" r="${RING.domain + 48}"/>
        <text class="rm-core-text" x="${RC.x}" y="${RC.y - RING.domain}" dy="0.35em" text-anchor="middle">${t(data.applied_research, 'band_label')}</text>
      </g>

      <g class="rm-core" data-id="core" tabindex="0">
        <circle class="rm-ring-band" cx="${RC.x}" cy="${RC.y}" r="${RING.tech}" stroke-width="100"/>
        <circle class="rm-ring-edge" cx="${RC.x}" cy="${RC.y}" r="${RING.tech - 50}"/>
        <circle class="rm-ring-edge" cx="${RC.x}" cy="${RC.y}" r="${RING.tech + 50}"/>
        <text class="rm-core-text" x="${RC.x}" y="${RC.y - RING.tech}" dy="0.35em" text-anchor="middle">${t(data.core_research, 'band_label')}</text>
      </g>

      <g class="rm-edges">
        ${edgeList().map(e => `<path class="rm-edge" data-a="${e.a}" data-b="${e.b}" d="${radialEdge(pos[e.a], pos[e.b])}"/>`).join('')}
      </g>

      <g class="rm-node rm-center" data-id="center" tabindex="0" transform="translate(${RC.x}, ${RC.y})">
        <circle class="rm-center-pulse" r="62"/>
        <circle class="rm-center-dot" r="62" fill="url(#rm-center-grad)"/>
        ${nodeLabel(t(data.center, 'label'), 17)}
      </g>

      ${data.techniques.map(tech => `
        <g class="rm-node rm-tech rm-group-${tech.group}" data-id="${tech.id}" tabindex="0" transform="translate(${pos[tech.id].x}, ${pos[tech.id].y})">
          ${nodeBox(116, 54)}
          ${nodeLabel(t(tech, 'label'), fitFont(t(tech, 'label'), 12, 10))}
        </g>
      `).join('')}

      ${data.domains.map(d => `
        <g class="rm-node rm-domain" data-id="${d.id}" tabindex="0" transform="translate(${pos[d.id].x}, ${pos[d.id].y})">
          ${nodeBox(104, 46)}
          ${nodeLabel(t(d, 'label'), fitFont(t(d, 'label'), 12, 10))}
        </g>
      `).join('')}
    </svg>
  `;
}

// Which layout to draw is set by "structure_view" in research.json ("tree" or "radial")
function renderMap() {
  return data.structure_view === 'radial' ? renderMapRadial() : renderMapTree();
}

function renderMapTree() {
  const pos = layout();
  const columns = t(data, 'columns');
  return `
    <svg class="rm-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t(data, 'map_title')}">
      <defs>
        <radialGradient id="rm-center-grad" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#10B981"/><stop offset="100%" stop-color="#00462A"/>
        </radialGradient>
      </defs>

      <rect class="rm-trust-field" x="24" y="${TOP - 70}" width="${TRUST_X + 30}" height="${BOTTOM - TOP + 130}" rx="24"/>
      <g class="rm-safety" data-id="safety" tabindex="0">
        <rect class="rm-trust-bar" x="${TRUST_X - 24}" y="${TOP - 60}" width="48" height="${BOTTOM - TOP + 110}" rx="24"/>
        <text class="rm-safety-text" transform="translate(${TRUST_X}, ${(TOP + BOTTOM) / 2}) rotate(90)" dy="0.35em" text-anchor="middle">${t(data.safety, 'ring_label')}</text>
      </g>

      <g class="rm-core" data-id="core" tabindex="0">
        <rect class="rm-core-band" x="${COL_X.tech - 80}" y="${TOP - 46}" width="160" height="${BOTTOM - TOP + 96}" rx="28"/>
        <text class="rm-core-text" x="${COL_X.tech}" y="${BOTTOM + 80}" text-anchor="middle">${t(data.core_research, 'band_label')}</text>
      </g>

      <g class="rm-core rm-applied" data-id="applied" tabindex="0">
        <rect class="rm-core-band" x="${COL_X.domain - 72}" y="${TOP - 46}" width="144" height="${BOTTOM - TOP + 96}" rx="28"/>
        <text class="rm-core-text" x="${COL_X.domain}" y="${BOTTOM + 80}" text-anchor="middle">${t(data.applied_research, 'band_label')}</text>
      </g>

      <g class="rm-columns">
        <text x="${COL_X.center}" y="62">${columns[0]}</text>
        <text x="${COL_X.tech}" y="62">${columns[1]}</text>
        <text x="${COL_X.domain}" y="62">${columns[2]}</text>
      </g>

      <g class="rm-edges">
        ${edgeList().map(e => `<path class="rm-edge" data-a="${e.a}" data-b="${e.b}" d="${edgePath(pos[e.a], pos[e.b])}"/>`).join('')}
      </g>

      <g class="rm-node rm-center" data-id="center" tabindex="0" transform="translate(${pos.center.x}, ${pos.center.y})">
        <circle class="rm-center-pulse" r="58"/>
        <circle class="rm-center-dot" r="58" fill="url(#rm-center-grad)"/>
        ${nodeLabel(t(data.center, 'label'), 17)}
      </g>

      ${data.techniques.map(tech => `
        <g class="rm-node rm-tech rm-group-${tech.group}" data-id="${tech.id}" tabindex="0" transform="translate(${pos[tech.id].x}, ${pos[tech.id].y})">
          ${nodeBox(124, 58)}
          ${nodeLabel(t(tech, 'label'), fitFont(t(tech, 'label'), 12.5, 11))}
        </g>
      `).join('')}

      ${data.domains.map(d => `
        <g class="rm-node rm-domain ${d.core ? 'rm-domain-core' : ''}" data-id="${d.id}" tabindex="0" transform="translate(${pos[d.id].x}, ${pos[d.id].y})">
          ${nodeBox(112, 48)}
          ${nodeLabel(t(d, 'label'), fitFont(t(d, 'label'), 12, 10))}
        </g>
      `).join('')}
    </svg>
  `;
}

// ---------- Shared pieces ----------

// Published papers first, then those under review
const sortPapers = (ids) => [...ids].sort((a, b) => Number(!(papersById[a] || {}).venue) - Number(!(papersById[b] || {}).venue));

// Keep only the name part of a title (before ':' or '?'), and cap the length
const shortTitleOf = (title) => {
  let st = title.split(/[:?]/)[0].trim();
  const words = st.split(' ');
  if (words.length > 7) st = words.slice(0, 6).join(' ') + '…';
  return st;
};

const renderPaper = (id) => {
  const paper = papersById[id];
  if (!paper) return '';
  const shortTitle = shortTitleOf(paper.title);
  const venue = (paper.venue || '').split('\n')[0] || (ko() ? '심사 중' : 'Under review');
  const title = paper.link
    ? `<a href="${paper.link}" target="_blank" title="${paper.title}" onclick="event.stopPropagation()">${shortTitle}</a>`
    : `<span title="${paper.title}">${shortTitle}</span>`;
  return `<li class="rs-paper">${title}<span class="rs-paper-venue">${venue}</span></li>`;
};

const renderPartner = (name) => {
  const logo = (data.partner_logos || {})[name];
  return `
    <span class="rs-partner" title="${name}">
      ${logo ? `<img src="${logo}" alt="${name}" onerror="this.replaceWith(document.createTextNode('${name}'))">` : name}
    </span>
  `;
};

// Status shown when a domain has no published papers yet
const renderStatus = (d) => {
  if (d.status === 'recruiting') {
    return `<span class="rs-status rs-status-recruit">${ko() ? '학생 모집 중' : 'Recruiting'}</span> <a class="rs-status-link" href="#/join" onclick="event.stopPropagation()">${ko() ? '모집 주제 보기 →' : 'See open topics →'}</a>`;
  }
  if (d.status === 'preparing') return `<span class="rs-status">${ko() ? '연구 준비 중' : 'Preparing'}</span>`;
  return `<span class="rs-status">${ko() ? '연구 진행 중' : 'In progress'}</span>`;
};

// ---------- Detail panel ----------

function kindLabel(kind, item) {
  if (kind === 'center') return ko() ? '출발점' : 'Starting point';
  if (kind === 'core') return ko() ? '가운데 열 전체' : 'Whole middle column';
  if (kind === 'applied') return ko() ? '오른쪽 열 전체' : 'Whole right column';
  if (kind === 'safety') return ko() ? '모든 연구의 기준' : 'Across all our work';
  if (kind === 'domain') return item.core ? (ko() ? '적용 분야 · AI 코어' : 'Domain · Core AI') : (ko() ? '적용 분야' : 'Domain');
  return ko() ? '데이터 사이언스 기술' : 'Data science technique';
}

function renderPanel(id) {
  const node = nodes[id || 'center'];
  const { kind, item } = node;
  const linkedIds = [...node.links].filter(l => l !== 'center');
  const papers = item.papers || [];
  const partners = item.partners || [];

  return `
    <div class="rm-panel-inner">
      <p class="rm-panel-kind">${kindLabel(kind, item)}</p>
      <h3 class="rm-panel-title">${t(item, 'title')}</h3>
      <p class="rm-panel-desc">${t(item, 'description')}</p>
      ${item.topics ? `<ul class="rs-project-list rm-topics">${t(item, 'topics').map(x => `<li>${x}</li>`).join('')}</ul>` : ''}
      ${kind === 'safety' ? data.trust.pillars.map(pl => `
        <p class="rm-panel-sub">${t(pl, 'title')}</p>
        <p class="rm-panel-desc rm-pillar-text">${t(pl, 'text')}</p>
        <ul class="rs-paper-list">${sortPapers(pl.papers).map(renderPaper).join('')}</ul>
        ${(t(pl, 'projects') || []).length ? `<ul class="rs-project-list">${t(pl, 'projects').map(pr => `<li>${pr}</li>`).join('')}</ul>` : ''}
      `).join('') : ''}
      ${linkedIds.length && kind !== 'safety' ? `
        <p class="rm-panel-sub">${kind === 'domain' ? (ko() ? '활용 기술' : 'Techniques used') : (ko() ? '연결된 항목' : 'Connected')}</p>
        <div class="rm-chips">${linkedIds.map(l => `<button class="rm-chip" onclick="rmSelect('${l}')">${t(nodes[l].item, 'title')}</button>`).join('')}</div>
      ` : ''}
      ${papers.length && kind !== 'safety' ? `
        <p class="rm-panel-sub">${ko() ? '관련 논문' : 'Publications'}</p>
        <ul class="rs-paper-list">${sortPapers(papers).map(renderPaper).join('')}</ul>
      ` : kind === 'domain' ? `<p class="rm-panel-sub">${ko() ? '현황' : 'Status'}</p><p>${renderStatus(item)}</p>` : ''}
      ${partners.length ? `
        <p class="rm-panel-sub">${ko() ? '협력 기관' : 'Partners'}</p>
        <div class="rs-partners">${partners.map(renderPartner).join('')}</div>
      ` : ''}
      ${id
        ? `<button class="rm-reset" onclick="rmSelect(null)">${ko() ? '← 처음으로' : '← Back to overview'}</button>`
        : `<p class="rm-hint">${ko() ? '항목을 눌러 자세히 보세요.' : 'Select an item for details.'}</p>`}
    </div>
  `;
}

// ---------- Highlight ----------

function highlight(id) {
  const svg = document.querySelector('.rm-svg');
  if (!svg) return;
  const active = id && id !== 'safety' ? new Set([id, ...nodes[id].links]) : null;
  svg.classList.toggle('rm-dim', !!active);
  svg.classList.toggle('rm-safety-on', id === 'safety');
  svg.classList.toggle('rm-core-on', id === 'core');
  svg.classList.toggle('rm-applied-on', id === 'applied');
  svg.querySelectorAll('.rm-node').forEach(el => {
    el.classList.toggle('is-on', !!active && active.has(el.dataset.id));
    el.classList.toggle('is-selected', el.dataset.id === id);
  });
  svg.querySelectorAll('.rm-edge').forEach(el => {
    el.classList.toggle('is-on', !!active && id !== 'safety' && (el.dataset.a === id || el.dataset.b === id || (id === 'core' && el.dataset.a === 'center')));
  });
}

let shownId;
function show(id) {
  highlight(id);
  if (shownId === id) return;
  shownId = id;
  const panel = document.getElementById('rm-panel');
  if (panel) panel.innerHTML = renderPanel(id);
}

function bindMap() {
  document.querySelectorAll('.rm-node, .rm-safety, .rm-core').forEach(el => {
    const id = el.dataset.id;
    el.addEventListener('mouseenter', () => show(id));
    el.addEventListener('mouseleave', () => show(selectedId));
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      window.rmSelect(selectedId === id ? null : id);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.rmSelect(id); }
    });
  });
  document.querySelector('.rm-canvas').addEventListener('click', () => { if (selectedId) window.rmSelect(null); });
}

// ---------- Page ----------

function renderBody() {
  const { approach } = data;
  return `
    <div class="rs-hero">
      <canvas class="rs-hero-canvas" aria-hidden="true"></canvas>
      <div class="rs-hero-text">
        ${data.intro.eyebrow ? `<p class="rs-hero-eyebrow">${t(data.intro, 'eyebrow')}</p>` : ''}
        <p class="rs-headline">${t(data.intro, 'headline')}</p>
        <p class="rs-intro-body">${t(data.intro, 'body')}</p>
        ${data.intro.pipeline ? `
          <ol class="rs-pipeline">
            ${t(data.intro, 'pipeline').map((step, i) => `<li>${step}</li>`).join('')}
          </ol>
        ` : ''}
      </div>
    </div>

    <section class="rs-section">
      <div class="rs-section-header rs-reveal">
        <h2 class="rs-section-title">${t(data, 'map_title')}</h2>
      </div>
      <div class="rm-layout">
        <div class="rm-canvas ${data.structure_view === 'radial' ? 'is-radial' : ''}">
          <p class="rm-try">${ko() ? '항목을 눌러 연결된 기술과 논문을 확인해 보세요' : 'Tap any item to see linked techniques and papers'}</p>
          ${renderMap()}
        </div>
        <aside id="rm-panel" class="rm-panel"></aside>
      </div>
      <div class="rs-explain">
        ${[
          { id: 'core', key: 'rm-key-coreband', item: data.axes.items.find(x => x.id === 'core') },
          { id: 'applied', key: 'rm-key-coreband', item: data.axes.items.find(x => x.id === 'applied') },
          { id: 'safety', key: 'rm-key-safety', item: data.axes.trust },
        ].map(box => `
          <button class="rs-explain-item rs-reveal" onclick="rmSelect('${box.id}', true)">
            <p class="rs-explain-key"><i class="rm-key ${box.key}"></i>${t(box.item, 'title')}</p>
            <p class="rs-explain-lead">${t(box.item, 'lead')}</p>
            <p class="rs-card-desc">${t(box.item, 'text')}</p>
          </button>
        `).join('')}
      </div>
    </section>

    <section class="rs-section">
      <div class="rs-section-header rs-reveal">
        <h2 class="rs-section-title">${t(approach, 'title')}</h2>
        <p class="rs-section-subtitle">${t(approach, 'subtitle')}</p>
      </div>
      <div class="rs-principles">
        ${approach.conditions.map((c, i) => `
          <div class="rs-principle rs-reveal">
            <span class="rs-principle-num">${String(i + 1).padStart(2, '0')}</span>
            <h3 class="rs-card-title">${t(c, 'title')}</h3>
            <p class="rs-card-desc">${t(c, 'text')}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="rs-section">
      <div class="rs-section-header rs-reveal">
        <h2 class="rs-section-title">${t(data, 'domains_title')}</h2>
      </div>
      <div class="rs-domain-table">
        <div class="rs-domain-row rs-domain-head">
          <span>${ko() ? '분야' : 'Domain'}</span>
          <span>${ko() ? '발표 논문' : 'Publications'}</span>
          <span>${ko() ? '협력 기관' : 'Partners'}</span>
        </div>
        ${data.domains.map(d => `
          <div class="rs-domain-row rs-reveal" onclick="rmSelect('${d.id}', true)">
            <p class="rs-data-title">${t(d, 'title')}</p>
            <div>
              ${d.papers.length
                ? `<ul class="rs-paper-list">${sortPapers(d.papers).map(renderPaper).join('')}</ul>`
                : `<p class="rs-data-example">${renderStatus(d)}</p>`}
            </div>
            <div class="rs-partners">${d.partners.map(renderPartner).join('')}</div>
          </div>
        `).join('')}
      </div>
      <p class="rs-join">${ko()
        ? '함께 연구하고 싶다면 <a href="#/join">Join Us</a> 페이지에서 모집 중인 주제를 확인해주세요.'
        : 'Interested in joining? See open topics on the <a href="#/join">Join Us</a> page.'}</p>
    </section>
  `;
}

function revealOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('rs-in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.rs-reveal').forEach(el => observer.observe(el));
}

// ---------- Hero animation ----------
// A live, simplified version of the research structure: data types on the left,
// the techniques we research in the middle, domains on the right. Pulses travel
// along real links (data -> technique -> domain) and light up the nodes they reach.

let heroFrame = null;

const DATA_TYPES = [
  { id: 'text', ko: '텍스트', en: 'Text', techs: ['agentic', 'ir', 'nlp'] },
  { id: 'image', ko: '이미지', en: 'Image', techs: ['mm', 'agentic'] },
  { id: 'series', ko: '시계열', en: 'Time series', techs: ['ts', 'opt'] },
  { id: 'table', ko: '로그 · 정형', en: 'Logs · tables', techs: ['ir', 'opt', 'ts'] },
];

function drawGlyph(ctx, id, x, y, color) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.4;
  if (id === 'text') {
    [0, 5, 10].forEach((dy, k) => { ctx.beginPath(); ctx.moveTo(x - 7, y - 5 + dy); ctx.lineTo(x + (k === 2 ? 3 : 7), y - 5 + dy); ctx.stroke(); });
  } else if (id === 'image') {
    ctx.strokeRect(x - 7, y - 6, 14, 12);
    ctx.beginPath(); ctx.moveTo(x - 6, y + 5); ctx.lineTo(x - 1, y - 1); ctx.lineTo(x + 2, y + 2); ctx.lineTo(x + 6, y - 2); ctx.stroke();
  } else if (id === 'series') {
    ctx.beginPath(); ctx.moveTo(x - 7, y + 3); ctx.lineTo(x - 3, y - 3); ctx.lineTo(x, y + 1); ctx.lineTo(x + 3, y - 5); ctx.lineTo(x + 7, y); ctx.stroke();
  } else {
    ctx.strokeRect(x - 7, y - 6, 14, 12);
    ctx.beginPath(); ctx.moveTo(x - 7, y - 2); ctx.lineTo(x + 7, y - 2); ctx.moveTo(x - 1, y - 6); ctx.lineTo(x - 1, y + 6); ctx.stroke();
  }
}

function startHero() {
  cancelAnimationFrame(heroFrame);
  const canvas = document.querySelector('.rs-hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const lang = getLang();
  let w = 0, h = 0, cols = null;

  const layoutHero = () => {
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const x0 = w * 0.44;
    // Three evenly spaced columns: data, techniques (midpoint), domains
    const dataX = x0 + (w - x0) * 0.08;
    const domainX = w - 70;
    const place = (items, x, pad) => items.map((it, k) => ({ ...it, x, y: pad + k * ((h - pad * 2) / Math.max(items.length - 1, 1)) }));
    cols = {
      data: place(DATA_TYPES, dataX, h * 0.24),
      tech: place(data.techniques.map(tc => ({ id: tc.id, label: pick(tc, 'title', lang), domains: tc.domains })), (dataX + domainX) / 2, h * 0.12),
      domain: place(data.domains.map(d => ({ id: d.id, label: pick(d, 'label', lang).join(' ') })), domainX, h * 0.08),
    };
    cols.byId = {};
    ['data', 'tech', 'domain'].forEach(c => cols[c].forEach(n => { cols.byId[`${c}:${n.id}`] = n; n.glow = 0; }));
  };
  layoutHero();

  const curve = (a, b, t) => {
    const mx = (a.x + b.x) / 2;
    const u = 1 - t;
    return {
      x: u * u * u * a.x + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * b.x,
      y: u * u * u * a.y + 3 * u * u * t * a.y + 3 * u * t * t * b.y + t * t * t * b.y,
    };
  };
  const strokeCurve = (a, b) => {
    const mx = (a.x + b.x) / 2;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.bezierCurveTo(mx, a.y, mx, b.y, b.x, b.y); ctx.stroke();
  };

  const pulses = [];
  const spawn = () => {
    const src = cols.data[Math.floor(Math.random() * cols.data.length)];
    const tech = cols.byId[`tech:${src.techs[Math.floor(Math.random() * src.techs.length)]}`];
    if (!tech) return;
    const dom = cols.byId[`domain:${tech.domains[Math.floor(Math.random() * tech.domains.length)]}`];
    pulses.push({ path: dom ? [src, tech, dom] : [src, tech], seg: 0, t: 0 });
    src.glow = 1;
  };

  const pill = (n, label, strong) => {
    ctx.font = `${strong ? 600 : 500} 11.5px Inter, sans-serif`;
    const tw = ctx.measureText(label).width;
    const pw = tw + 20, ph = 22;
    const x = n.x - pw / 2, y = n.y - ph / 2;
    ctx.beginPath(); ctx.roundRect(x, y, pw, ph, 11);
    ctx.fillStyle = n.glow > 0.02 ? `rgba(16, 185, 129, ${0.12 + n.glow * 0.25})` : '#fff';
    ctx.fill();
    ctx.strokeStyle = strong ? 'rgba(0, 70, 42, 0.55)' : 'rgba(24, 24, 27, 0.18)';
    ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = strong ? '#00462A' : '#3f3f46';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, n.x, n.y + 0.5);
  };

  window.addEventListener('resize', layoutHero);
  let last = performance.now(), sinceSpawn = 0;

  const draw = (now = performance.now()) => {
    if (!canvas.isConnected) { window.removeEventListener('resize', layoutHero); return; }
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    // Re-measure if the box was not laid out yet or has changed size
    if (canvas.clientWidth !== w || canvas.clientHeight !== h) layoutHero();
    ctx.clearRect(0, 0, w, h);
    if (w < 720) { if (!reduced) heroFrame = requestAnimationFrame(draw); return; }

    // Column captions
    ctx.font = '600 10.5px Inter, sans-serif'; ctx.fillStyle = 'rgba(24, 24, 27, 0.4)'; ctx.textAlign = 'center';
    const captions = lang === 'ko' ? ['데이터', '연구하는 기술'] : ['Data', 'Techniques'];
    [cols.data[0].x, cols.tech[0].x].forEach((x, k) => ctx.fillText(captions[k], x, 18));

    // Faint links
    ctx.strokeStyle = 'rgba(24, 24, 27, 0.07)'; ctx.lineWidth = 1;
    cols.data.forEach(d => d.techs.forEach(tid => { const tn = cols.byId[`tech:${tid}`]; if (tn) strokeCurve(d, tn); }));
    cols.tech.forEach(tn => tn.domains.forEach(did => { const dn = cols.byId[`domain:${did}`]; if (dn) strokeCurve(tn, dn); }));

    // Pulses
    sinceSpawn += dt;
    if (sinceSpawn > 0.45) { spawn(); sinceSpawn = 0; }
    for (let k = pulses.length - 1; k >= 0; k--) {
      const p = pulses[k];
      p.t += dt / 1.1;
      const a = p.path[p.seg], b = p.path[p.seg + 1];
      if (p.t >= 1) {
        b.glow = 1; p.seg += 1; p.t = 0;
        if (p.seg >= p.path.length - 1) { pulses.splice(k, 1); continue; }
      }
      const pt = curve(p.path[p.seg], p.path[p.seg + 1], p.t);
      // short trail
      for (let s = 0; s < 6; s++) {
        const q = curve(p.path[p.seg], p.path[p.seg + 1], Math.max(0, p.t - s * 0.025));
        ctx.beginPath(); ctx.arc(q.x, q.y, 3 - s * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.8 - s * 0.13})`; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 3.2, 0, Math.PI * 2); ctx.fillStyle = '#00462A'; ctx.fill();
    }

    // Nodes
    cols.data.forEach(d => {
      d.glow *= 0.95;
      ctx.beginPath(); ctx.arc(d.x, d.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = d.glow > 0.02 ? `rgba(16, 185, 129, ${0.1 + d.glow * 0.25})` : '#fff'; ctx.fill();
      ctx.strokeStyle = 'rgba(24, 24, 27, 0.18)'; ctx.lineWidth = 1; ctx.stroke();
      drawGlyph(ctx, d.id, d.x, d.y, '#3f3f46');
      ctx.font = '500 10.5px Inter, sans-serif'; ctx.fillStyle = '#71717a'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(lang === 'ko' ? d.ko : d.en, d.x, d.y + 19);
    });
    cols.tech.forEach(n => { n.glow *= 0.95; pill(n, n.label, true); });
    cols.domain.forEach(n => { n.glow *= 0.95; pill(n, n.label, false); });

    if (!reduced) heroFrame = requestAnimationFrame(draw);
  };
  if (reduced) { for (let k = 0; k < 6; k++) spawn(); }
  draw();
}

// Every few seconds, briefly light up a random node so visitors notice it is clickable
let twinkleTimer = null;
function startTwinkle() {
  clearInterval(twinkleTimer);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  twinkleTimer = setInterval(() => {
    const svg = document.querySelector('.rm-svg');
    if (!svg) { clearInterval(twinkleTimer); return; }
    if (selectedId) return;
    const candidates = [...svg.querySelectorAll('.rm-node:not(.rm-center)')];
    const el = candidates[Math.floor(Math.random() * candidates.length)];
    el.classList.add('rm-twinkle');
    setTimeout(() => el.classList.remove('rm-twinkle'), 1600);
  }, 3200);
}

function afterRender() {
  startHero();
  startTwinkle();
  shownId = undefined;
  bindMap();
  show(selectedId);
  revealOnScroll();
}

export function mount() {
  selectedId = null;
  window.rmSelect = (id, scroll = false) => {
    selectedId = id;
    show(id);
    if (scroll) document.querySelector('.rm-layout').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  window.toggleResearchLang = (lang) => {
    setLang(lang);
    document.querySelectorAll('#research-lang .lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent === (lang === 'ko' ? '한국어' : 'English'));
    });
    document.getElementById('research-body').innerHTML = renderBody();
    afterRender();
  };
  afterRender();
}

export default async function Research() {
  data = await loadData('research.json');
  const papers = (await loadData('publications/international.json')) || [];
  if (!data) return '<p>Error loading research data.</p>';
  papersById = Object.fromEntries(papers.map(p => [p.id, p]));
  buildGraph();

  return `
    <section class="page-content">
      <div class="ra-page-header">
        <div>
          <h1 class="page-title">${ko() ? '연구 분야' : 'Research'}</h1>
        </div>
      </div>
      <div id="research-body" class="rs-body">
        ${renderBody()}
      </div>
    </section>
  `;
}
