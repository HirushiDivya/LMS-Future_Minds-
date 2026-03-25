import React, { useEffect, useState } from "react";
import "./About.css";
import { FaBookOpen, FaClock, FaCheckCircle, FaGraduationCap } from "react-icons/fa";

const Home = () => {
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  return (
    <div className="about-page">
      <div className="about-container">
        {/* Welcome Section */}
        <section className="about-hero">
          <h1 className="about-title">
            Welcome Back, <span className="highlight">{userName}!</span>
          </h1>
          <div className="title-underline"></div>
          <p className="about-subtitle">
            "Education is the most powerful weapon which you can use to change the world."
          </p>
        </section>

        {/* Dashboard Stats */}
        <div className="about-grid">
          <div className="about-card">
            <div className="icon-wrapper">
              <FaBookOpen className="about-icon" />
            </div>
            <h3>04</h3>
            <p>Enrolled Courses</p>
          </div>

          <div className="about-card">
            <div className="icon-wrapper">
              <FaClock className="about-icon" />
            </div>
            <h3>12h</h3>
            <p>Study Hours This Week</p>
          </div>

          <div className="about-card">
            <div className="icon-wrapper">
              <FaCheckCircle className="about-icon" />
            </div>
            <h3>85%</h3>
            <p>Average Progress</p>
          </div>

          <div className="about-card">
            <div className="icon-wrapper">
              <FaGraduationCap className="about-icon" />
            </div>
            <h3>02</h3>
            <p>Certificates Earned</p>
          </div>
        </div>

        {/* Continue Learning & Tasks */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" }}>
          
          {/* Recent Activity Box */}
          <section className="about-mission-box" style={{ marginBottom: "0" }}>
            <div className="mission-content">
              <h2>Recent Activity</h2>
              <ul style={{ listStyle: "none", padding: "0", color: "#cbd5e0" }}>
                <li style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  ✅ Completed: Introduction to React Hooks
                </li>
                <li style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  📖 Started: Advanced CSS Grid Layouts
                </li>
                <li style={{ padding: "10px 0" }}>
                  🏆 Earned Badge: "Speed Learner"
                </li>
              </ul>
            </div>
          </section>

          {/* Upcoming Deadlines */}
          <section className="about-mission-box" style={{ marginBottom: "0", borderLeft: "5px solid #ffcc00" }}>
            <div className="mission-content">
              <h2>Upcoming Tasks</h2>
              <ul style={{ listStyle: "none", padding: "0", color: "#cbd5e0" }}>
                <li style={{ padding: "10px 0", color: "#ffcc00" }}>
                  ⏰ Assignment: JavaScript Promises (Due Tomorrow)
                </li>
                <li style={{ padding: "10px 0" }}>
                  📅 Live Session: Q&A with Industry Experts (Friday)
                </li>
                <li style={{ padding: "10px 0" }}>
                  📝 Quiz: Database Management (Next Monday)
                </li>
              </ul>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Home;