import React, { useEffect, useState } from "react";
import "./About.css";
import API from "./API";
import {
  FaBookOpen,
  FaClock,
  FaCheckCircle,
  FaGraduationCap,
} from "react-icons/fa";

//after login page
const Home = () => {
  const [userName, setUserName] = useState("Student");
  const [enrolledQuizCount, setEnrolledQuizCount] = useState(0);
  const [enrolledCourseCount, setEnrolledCourseCount] = useState(0);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const studentId = localStorage.getItem("userID");

    if (studentId) {
      API.get(`/quiz/student-enrolled-count/${studentId}`)
        .then((res) => {
          setEnrolledQuizCount(res.data.enrolled_count);
        })
        .catch((err) => console.error("Error fetching count:", err));
    }
    API.get(`/courses/student-enrolled-count/${studentId}`)
      .then((res) => {
        setEnrolledCourseCount(res.data.enrolled_courses_count);
      })
      .catch((err) => console.error("Error fetching course count:", err));

    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  return (
    <div className="home-page">
      <div className="about-container">
        {/* Welcome Section */}
        <section className="about-hero">
          <h1 className="about-title" style={{ paddingTop: "30px" }}>
            Welcome Back, <span className="highlight">{userName}!</span>
          </h1>
          <div className="title-underline"></div>
          <p className="about-subtitle">
            "Education is the most powerful weapon which you can use to change
            the world."
          </p>
        </section>

        {/* Dashboard Stats */}
        <div className="about-grid">
          <div className="about-card">
            <div className="icon-wrapper">
              <FaBookOpen className="about-icon" />
            </div>
            <h3 className="aboutcardh3">{enrolledCourseCount}</h3>
            <p className="about-small-card">Enrolled Courses</p>
          </div>

          <div className="about-card">
            <div className="icon-wrapper">
              <FaClock className="about-icon" />
            </div>
            <h3 className="aboutcardh3">12h</h3>
            <p className="about-small-card">Study Hours This Week</p>
          </div>

          <div className="about-card">
            <div className="icon-wrapper">
              <FaCheckCircle className="about-icon" />
            </div>
            <h3 className="aboutcardh3">85%</h3>
            <p className="about-small-card">Average Progress</p>
          </div>

          <div className="about-card">
            <div className="icon-wrapper">
              <FaGraduationCap className="about-icon" />
            </div>
            <h3 className="aboutcardh3">{enrolledQuizCount}</h3>
            <p className="about-small-card">Enrolled Quizes</p>
          </div>
        </div>

        {/* Continue Learning & Tasks */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "25px",
          }}
        >
          {/* Recent Activity Box */}
          <section
            className="about-mission-box"
            style={{ marginBottom: "20px" }}
          >
            <div className="mission-content">
              <h2>Recent Activity</h2>
              <ul style={{ listStyle: "none", padding: "0", color: "#999696" }}>
                <li
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  ✅ Completed: Introduction to React Hooks
                </li>
                <li
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  📖 Started: Advanced CSS Grid Layouts
                </li>
                <li style={{ padding: "10px 0" }}>
                  🏆 Earned Badge: "Speed Learner"
                </li>
              </ul>
            </div>
          </section>

          {/* Upcoming Deadlines */}
          <section
            className="about-mission-box"
            style={{ marginBottom: "20px", borderLeft: "5px solid #ffcc00" }}
          >
            <div className="mission-content">
              <h2>Upcoming Tasks</h2>
              <ul style={{ listStyle: "none", padding: "0", color: "#999696" }}>
                <li
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  ⏰ Assignment: JavaScript Promises (Due Tomorrow)
                </li>
                <li
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
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
