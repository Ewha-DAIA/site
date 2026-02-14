import { CONFIG } from '../config.js';

export default function Header() {
  return `
    <nav class="navbar">
      <div class="logo">
        <a href="#/">
          <img src="/assets/ewha/symbol.png" alt="Ewha Logo" class="logo-image">
          <span class="logo-text">${CONFIG.LAB_NAME}</span>
        </a>
      </div>
      <ul class="nav-links">
        <li><a href="#/">Home</a></li>
        <li><a href="#/research">Research</a></li>
        <li class="nav-dropdown">
          <a href="#/people/professor">People</a>
          <ul class="dropdown-menu">
            <li><a href="#/people/professor">Professor</a></li>
            <li><a href="#/people/members">Members</a></li>
            <li><a href="#/people/alumni">Alumni</a></li>
          </ul>
        </li>
        <li class="nav-dropdown">
          <a href="#/publications">Publications</a>
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
