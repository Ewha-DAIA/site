import { CONFIG } from '../config.js';

export default function Contact() {
  return `
    <section class="page-content">
      <h1 class="page-title">Contact Us</h1>
      
      <div class="contact-container">
        <div class="contact-info">
          <div class="info-item">
            <div class="info-details">
              <h3>Location</h3>
              <p>이화여자대학교 ECC B132-2<br>
              서울특별시 서대문구 이화여대길 52, 03760</p>
            </div>
          </div>
          
          <div class="info-item">
            <h3>Email</h3>
            <p><a href="mailto:yeop@ewha.ac.kr">yeop@ewha.ac.kr</a></p>
          </div>

          <div class="info-item">
            <h3>GitHub</h3>
            <div class="contact-social">
              <a href="https://github.com/Ewha-DAIA" target="_blank">Ewha-DAIA</a>
            </div>
          </div>
        </div>

        <div class="contact-map">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1700!2d126.94608807479936!3d37.56096340000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357c994fa1b65811%3A0xdb38fb1d0e605351!2z7J207ZmU7Lqg7Y287IqkIOuyte2VqeuLqOyngChFQ0Mp!5e0!3m2!1sko!2skr!4v1770988645211!5m2!1sko!2skr" 
            width="100%" 
            height="100%" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy">
          </iframe>
        </div>
      </div>
    </section>
  `;
}
