import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import "./Home.css";

const sections = [

  { title: "Video Lessons", desc: "Access uploaded and YouTube embedded learning content.", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=500" },
  { title: "Live Classes", desc: "Join interactive Zoom meetings for live learning.", img: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=500" },
  { title: "Smart Quizzes", desc: "Attempt MCQ exams and get instant auto-evaluated results.", img: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=500&auto=format&fit=crop" },
  { title: "Secure Payments", desc: "Easy online payments and manual bank slip upload options.", img: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=500" },
  { title: "Progress Monitoring", desc: "Track your course completion and status in real-time.", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=500" },
  { title: "Expert Support", desc: "Full administrative control to ensure a smooth learning experience.", img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=500" }
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      {/* Top-right buttons */}
      <div className="top-buttons">
        <button className="btn-signin" onClick={() => navigate("/login")}>
          <FaSignInAlt /> Sign In
        </button>
        <button className="btn-signup" onClick={() => navigate("/student-reg")}>
          <FaUserPlus /> Sign Up
        </button>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Looking to Boost Your Skills?</h1>
          <p>Learn from top instructors and join our global learning community.</p>
          <button className="cta-btn" onClick={() => navigate("/student-reg")}>Get Started</button>
        </div>
        <div className="hero-img">
          <img src="https://images.unsplash.com/photo-1496065187959-7f07b8353c55?auto=format&fit=crop&q=80&w=700" alt="Learning" />
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        {sections.map((s, idx) => (
          <div className="category-card" key={idx}>
            <img src={s.img} alt={s.title} />
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <button onClick={() => alert(`Go to ${s.title}`)}>Explore</button>
          </div>
        ))}
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <h2>Stay Updated with Our Latest Courses</h2>
        <div className="newsletter-input">
          <input type="email" placeholder="Enter your email..." />
          <button>Subscribe</button>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>© 2026 SkillBridge LMS. All rights reserved.</p>
      </footer>
    </div>
  );
}
