import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API";
import "../Admin/css/Admindashbord.css";

import { Users, BookOpen, CreditCard, UserPlus, Bell } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
 
const Admindashbord = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    total_students: 0,
    total_courses: 0,
    total_quizzes: 0,
    total_enrollments: 0,
    approved_enrollments: 0,
    pending_enrollments: 0,
    approved_quiz_enrollmnts: 0,
    pending_quiz_enrollmnts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get("/admin/dashboard-stats");
        setCounts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };
    fetchStats();

    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const stats = [
    {
      title: "Total Students",
      count: counts.total_students,
      icon: <Users />,
      color: "#2563eb",
    },
    {
      title: "Courses",
      count: counts.total_courses,
      icon: <BookOpen />,
      color: "#4f46e5",
    },
    {
      title: "Quizzes",
      count: counts.total_quizzes,
      icon: <BookOpen />,
      color: "#4f46e5",
    },
    {
      title: "Pending Course Approvals",
      count: counts.pending_enrollments,
      icon: <CreditCard />,
      color: "#ef4444",
      clickable: true,
    },
    {
      title: "Total Course Enrollments",
      count: counts.total_enrollments,
      icon: <UserPlus />,
      color: "#f97316",
    },
    {
      title: "Pending Quiz Approvals",
      count: counts.pending_quiz_enrollmnts,
      icon: <CreditCard />,
      color: "#ef4444",
      clickable: true,
    },
    {
      title: "Total Quiz Enrollments",
      count: counts.approved_quiz_enrollmnts,
      icon: <UserPlus />,
      color: "#f97316",
    },
  ];

  const enrollmentData = [
    { name: "Jan", students: 40 },
    { name: "Feb", students: 120 },
    { name: "Mar", students: 500 },
    { name: "Apr", students: 300 },
    { name: "May", students: 450 },
  ];

  if (loading) return <div className="loading-screen">Loading...</div>;

  return ( 
    <div className="admin-dashboard-wrapper">
      <main className="admin-main-content">
        <header className="dashboard-header-flex">
          <h1 className="dashboard-title-text">System Overview</h1>

          <div className="notification-container" ref={notificationRef}>
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell color="#ffcc00" size={28} />
              {counts.pending_enrollments > 0 && (
                <span className="notification-badge">
                  {counts.pending_enrollments}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <p className="notif-title">
                  Pending Enrollment Requests = {counts.pending_enrollments}
                </p>
                <button
                  className="view-req-btn"
                  onClick={() => navigate("/enrollment-req")}
                >
                  View All Requests
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="stats-grid">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className={`stat-card ${item.clickable ? "clickable-stat" : ""}`}
              onClick={() => {
                if (item.clickable) {
                  navigate(
                    item.title === "Pending Quiz Approvals"
                      ? "/quizenrollment-req"
                      : "/enrollment-req",
                  );
                }
              }}
            >
              <div
                className="stat-icon"
                style={{ backgroundColor: item.color }}
              >
                {item.icon}
              </div>
              <div className="stat-info">
                <p>{item.title}</p>
                <h2>{item.count}</h2>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="card-panel">
            <h3 className="card-title">Enrollment Trend</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(147, 135, 135, 0.5)" />
                  <YAxis stroke="rgba(147, 135, 135, 0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1c23",
                      border: "1px solid #444",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="#ffcc00"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card-panel">
            <h3 className="card-title">Quick Status</h3>
            <div className="status-box status-pending">
              <span>Pending Approvals</span>
              <span className="count">{counts.pending_enrollments}</span>
            </div>
            <div className="status-box status-approved">
              <span>Approved Total</span>
              <span className="count">{counts.approved_enrollments}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admindashbord;
