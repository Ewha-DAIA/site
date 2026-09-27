// Site-wide language setting. Every page load starts in Korean; a switch to
// English lasts while you move between pages, until the page is reloaded.
let current = 'ko';

export function getLang() {
  return current;
}

export function setLang(lang) {
  current = lang === 'en' ? 'en' : 'ko';
}

// Pick `${key}_ko` in Korean mode when present, otherwise the English field
export function pick(obj, key, lang = getLang()) {
  return (lang === 'ko' && obj[`${key}_ko`]) ? obj[`${key}_ko`] : obj[key];
}

export function langToggle(onClickFn, lang = getLang()) {
  return `
    <div class="ra-lang-toggle">
      <button class="lang-btn ${lang === 'ko' ? 'active' : ''}" onclick="${onClickFn}('ko')">한국어</button>
      <button class="lang-btn ${lang === 'en' ? 'active' : ''}" onclick="${onClickFn}('en')">English</button>
    </div>
  `;
}
