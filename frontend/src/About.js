import React from 'react';
import './About.css';
import { FaRocket, FaLightbulb, FaUsers, FaGraduationCap } from 'react-icons/fa';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        {/* Hero Section */}
        <section className="about-hero">
          <h1 className="about-title">
            About <span className="highlight">FutureMinds</span>
          </h1>
          <div className="title-underline"></div>
          <p className="about-subtitle">
            Architecting the digital leaders of tomorrow through innovation and education.
          </p>
        </section>

        {/* Mission Section */}
        <section className="about-mission-box">
          <div className="mission-content">
            <h2>Our Mission</h2>
            <p>
              At FutureMinds, we aim to bridge the gap between academic learning and industry demands. 
              We empower students with real-world skills in coding, design, and technology to ensure 
              they don't just find jobs, but build careers.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <div className="about-grid">
          <div className="about-card">
            <div className="icon-wrapper">
              <FaRocket className="about-icon" />
            </div>
            <h3>Innovation</h3>
            <p>Stay ahead with a curriculum updated weekly to reflect the latest tech trends.</p>
          </div>

          <div className="about-card">
            <div className="icon-wrapper">
              <FaLightbulb className="about-icon" />
            </div>
            <h3>Expert Mentors</h3>
            <p>Learn directly from professionals currently working in top-tier tech companies.</p>
          </div>

          <div className="about-card">
            <div className="icon-wrapper">
              <FaUsers className="about-icon" />
            </div>
            <h3>Community</h3>
            <p>Join a network of over 5,000+ students and alumni helping each other grow.</p>
          </div>

          <div className="about-card">
            <div className="icon-wrapper">
              <FaGraduationCap className="about-icon" />
            </div>
            <h3>Certification</h3>
            <p>Earn industry-recognized certificates that give you a competitive edge.</p>
          </div>
        </div>

        {/* Quote Section */}
        <section className="about-quote-section">
          <div className="quote-container">
            <p className="quote-text">
              "The best way to predict the future is to create it. We provide the tools; you provide the vision."
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;