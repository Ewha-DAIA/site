import { CONFIG } from '../config.js';

export default function Footer() {
  return `
    <div class="footer-content">
      <p>&copy; ${new Date().getFullYear()} ${CONFIG.LAB_FULL_NAME}. All rights reserved.</p>
    </div>
  `;
}
