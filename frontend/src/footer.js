import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Links */}
        <div className="footer-top">
          <div>
            <h4>Categories</h4>
            <ul>
              <li>Language</li>
              <li>Management</li>
              <li>Personal Development</li>
              <li>Sales & Marketing</li>
            </ul>
          </div>
          <div>
            <h4>About</h4>
            <ul>
              <li>Our Course Creators</li>
              <li>Learning on Alison</li>
              <li>Blog</li>
              <li>Press Room</li>
            </ul>
          </div>
          <div>
            <h4>Learners</h4>
            <ul>
              <li>Graduate Profiles</li>
              <li>Hubs</li>
              <li>Premium Learning</li>
            </ul>
          </div>
          <div>
            <h4>Partners</h4>
            <ul>
              <li>Integrate API</li>
              <li>Refer a Friend</li>
              <li>Webinars</li>
            </ul>
          </div>
        </div>

        {/* Bottom: Branding + Apps + Social */}
        <div className="footer-bottom">
          <div className="footer-brand">
            <div className="brand-name"><span>▲</span> FutureMinds</div>
            <p className="tagline">Empower Yourself</p>
            <div className="socials">
              <div className="social facebook">f</div>
              <div className="social x">X</div>
              <div className="social linkedin">in</div>
              <div className="social youtube">▶</div>
            </div>
          </div>

          <div className="footer-apps">
            <button>App Store</button>
            <button>Google Play</button>
          </div>
        </div>

        {/* Legal */}
        <div className="footer-legal">
          <p>© FutureMinds 2026</p>
          <div className="legal-links">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Cookie Policy</span>
            <span>Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
