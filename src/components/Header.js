
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
  let activePortal = null;
  let activeDropdown = null;

  function isMobile() {
    return window.innerWidth <= 900;
  }

  function removePortal() {
    if (activePortal) {
      activePortal.classList.remove('show');
      setTimeout(() => {
        if (activePortal && activePortal.parentNode) {
          activePortal.parentNode.removeChild(activePortal);
        }
        activePortal = null;
      }, 200);
    }
  }

  function closeAllDropdowns() {
    // Close desktop inline dropdowns
    document.querySelectorAll('.nav-dropdown.open').forEach(dd => {
      dd.classList.remove('open');
    });
    // Close mobile portal
    removePortal();
    activeDropdown = null;
  }

  function showPortal(toggle, menu) {
    removePortal();

    // Create portal element with cloned menu items
    const portal = document.createElement('ul');
    portal.className = 'dropdown-portal';
    portal.innerHTML = menu.innerHTML;

    document.body.appendChild(portal);
    activePortal = portal;

    // Position below the toggle button
    const rect = toggle.getBoundingClientRect();
    portal.style.top = (rect.bottom + 4) + 'px';

    // Calculate left position, ensuring it doesn't go off-screen
    let leftPos = rect.left;
    const portalWidth = Math.max(portal.offsetWidth, 150);
    if (leftPos + portalWidth > window.innerWidth - 8) {
      leftPos = window.innerWidth - portalWidth - 8;
    }
    if (leftPos < 8) leftPos = 8;
    portal.style.left = leftPos + 'px';

    // Trigger animation
    requestAnimationFrame(() => {
      portal.classList.add('show');
    });

    // Handle clicks on portal links
    portal.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeAllDropdowns();
      });
    });
  }

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      const parentDropdown = toggle.closest('.nav-dropdown');
      const menu = parentDropdown.querySelector('.dropdown-menu');
      const isCurrentlyActive = (activeDropdown === parentDropdown);

      if (isMobile()) {
        // Mobile: use portal approach
        e.preventDefault();
        e.stopPropagation();

        if (isCurrentlyActive) {
          closeAllDropdowns();
        } else {
          closeAllDropdowns();
          activeDropdown = parentDropdown;
          parentDropdown.classList.add('open');
          showPortal(toggle, menu);
        }
      } else {
        // Desktop: use inline dropdown (existing behavior)
        const isOpen = parentDropdown.classList.contains('open');
        closeAllDropdowns();

        if (!isOpen) {
          e.preventDefault();
          e.stopPropagation();
          parentDropdown.classList.add('open');
        }
      }
    });
  });

  // Close dropdowns when clicking a sub-menu item (desktop inline)
  document.querySelectorAll('.dropdown-menu a').forEach(link => {
    link.addEventListener('click', () => {
      closeAllDropdowns();
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown') && !e.target.closest('.dropdown-portal')) {
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
