
export default function Header() {
  return `
    <nav class="navbar">
      <div class="logo">
        <a href="#/">
          <img src="./assets/ewha/symbol.png" alt="Ewha Logo" class="logo-image">
          <span class="logo-text"><span class="logo-text-lab">DAIA Lab</span><span class="logo-text-ewha"> @ Ewha</span></span>
        </a>
      </div>
      <ul class="nav-links">
        <li><a href="#/">Home</a></li>
        <li><a href="#/research">Research</a></li>
        <li class="nav-dropdown">
          <a href="#/people/professor" class="dropdown-toggle">People <span class="dropdown-arrow">▾</span></a>
          <ul class="dropdown-menu">
            <li><a href="#/people/professor">Professor</a></li>
            <li><a href="#/people/members">Members</a></li>
            <li><a href="#/people/alumni">Alumni</a></li>
          </ul>
        </li>
        <li class="nav-dropdown">
          <a href="#/publications" class="dropdown-toggle">Publications <span class="dropdown-arrow">▾</span></a>
          <ul class="dropdown-menu">
            <li><a href="#/publications/international">International</a></li>
            <li><a href="#/publications/domestic">Domestic</a></li>
            <li><a href="#/publications/patent">Patent</a></li>
          </ul>
        </li>
        <li><a href="#/projects">Projects</a></li>
        <li><a href="#/teaching">Teaching</a></li>
        <li><a href="#/gallery">Gallery</a></li>
        <li><a href="#/contact">Contact</a></li>
      </ul>
    </nav>
  `;
}

export function mountHeader() {
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  function closeAllDropdowns() {
    document.querySelectorAll('.nav-dropdown.open').forEach(dd => {
      dd.classList.remove('open');
      // Reset inline left style so it doesn't stick around
      const menu = dd.querySelector('.dropdown-menu');
      if (menu) menu.style.left = '';
    });
  }

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      const parentDropdown = toggle.closest('.nav-dropdown');
      const isOpen = parentDropdown.classList.contains('open');

      // Close all other dropdowns first
      closeAllDropdowns();

      if (!isOpen) {
        // Open this dropdown, prevent navigation
        e.preventDefault();
        e.stopPropagation();
        parentDropdown.classList.add('open');

        // Position the fixed dropdown under the toggle on small screens
        const menu = parentDropdown.querySelector('.dropdown-menu');
        if (window.innerWidth <= 900 && menu) {
          const rect = toggle.getBoundingClientRect();
          menu.style.left = rect.left + 'px';
        }
      }
      // If already open, allow the default link navigation
    });
  });

  // Close dropdowns when clicking a sub-menu item
  document.querySelectorAll('.dropdown-menu a').forEach(link => {
    link.addEventListener('click', () => {
      closeAllDropdowns();
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      closeAllDropdowns();
    }
  });

  // Close dropdowns on window resize to prevent stale positioning
  window.addEventListener('resize', () => {
    closeAllDropdowns();
  });

  // Close dropdowns when nav-links is scrolled
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.addEventListener('scroll', () => {
      closeAllDropdowns();
    });
  }
}
