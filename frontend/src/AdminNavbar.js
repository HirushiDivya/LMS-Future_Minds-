import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  UserPlus,
} from "lucide-react";
import "./AdminNavbar.css";
import { FaSignOutAlt, FaSun, FaMoon } from "react-icons/fa";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
 
  // Logout Modal එක පාලනය කිරීමට අලුත් state එකක්
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const confirmLogoutAction = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <>
      <aside className="admin-sidebar">
        <div className="sidebar-header">LMS ADMIN</div>

        <nav className="nav-container">
          <NavLink
            to="/a-dashbord"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/all-students"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <Users size={20} /> <span>Students</span>
          </NavLink>

          <NavLink
            to="/a-courses"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <BookOpen size={20} /> <span>Courses</span>
          </NavLink>

          
          <NavLink
            to="/a-quiz"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <BookOpen size={20} /> <span>Quizes</span>
          </NavLink>

          <NavLink
            to="/all-payments"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <CreditCard size={20} /> <span>Payments</span>
          </NavLink>

          <NavLink
            to="/enrollment-req"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <UserPlus size={20} /> <span>Enrollments</span>
          </NavLink>
        </nav>

        {/* Theme Toggle */}
        {/* Dark/Light Mode Button */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? (
            <FaMoon />
          ) : (
            <FaSun style={{ color: "#ffeb3b" }} />
          )}
        </button>

        <div className="sidebar-footer">
          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="logout-btn-nav"
            title="Logout"
          >
            <FaSignOutAlt />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* ==============================
          Logout Confirmation Modal 
      ============================== */}
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
              backdropFilter: "blur(20px)",
              padding: "40px",
              borderRadius: "30px",
              width: "380px",
              textAlign: "center",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              color: "white",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>👋</div>
            <h3
              style={{
                color: "#ffeb3b",
                marginBottom: "15px",
                fontSize: "1.6rem",
              }}
            >
              Ready to Leave?
            </h3>
            <p style={{ marginBottom: "25px", opacity: 0.9 }}>
              Are you sure you want to log out from the admin panel?
            </p>

            <div
              style={{ display: "flex", gap: "15px", justifyContent: "center" }}
            >
              <button
                onClick={confirmLogoutAction}
                style={{
                  background: "linear-gradient(45deg, #00d2ff, #3a7bd5)",
                  color: "white",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "15px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  flex: 1,
                  fontSize: "0.9rem",
                  transition: "0.3s",
                }}
              >
                Yes, Logout
              </button>

              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  padding: "12px 20px",
                  borderRadius: "15px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  flex: 1,
                  fontSize: "0.9rem",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;
