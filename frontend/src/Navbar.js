import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { FaUser, FaSignOutAlt, FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa"; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); 
  const navigate = useNavigate();
 
  // Theme configuration
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Logout
  const confirmLogoutAction = () => {
    localStorage.clear();
    setUserName("");
    setShowLogoutConfirm(false);
    navigate("/");
    window.location.reload();
  };

  const closeMenu = () => {
    setIsOpen(false);
  };
 
  return (
    <>
      <header className="navbar">
        <div className="container">
          {/* Logo */}
          <Link to="/" className="logo" onClick={closeMenu}>
            <span>▲</span> FutureMinds
          </Link>

          {/* Navigation Links */}
          <nav className={`nav-links ${isOpen ? "open" : ""}`}>
            <NavLink to="/home" end className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink to="/all-courses" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
              Courses
            </NavLink>
            <NavLink to="/s-allquiz" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
              Quizzes
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
              About
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
              Contact
            </NavLink> 

            {/* Theme Toggle */}
            <button className="theme-toggle" onClick={() => { toggleTheme(); closeMenu(); }}>
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </button>

            {!userName ? (
              <>
                <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
                <NavLink to="/student-reg" onClick={closeMenu}>Register</NavLink>
              </>
            ) : (
              <div className="user-profile-nav">
                <NavLink to={`/s-profile/${userName}`} className="user-info" onClick={closeMenu}>
                  <FaUser className="user-icon" />
                  <span className="user-name">{userName}</span>
                </NavLink>
                {/* Logout Button  Click -> disply Modal*/}
                <button onClick={() => setShowLogoutConfirm(true)} className="logout-btn-nav">
                  <FaSignOutAlt />
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
             {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      {/* Logout Confirmation Modal  */}
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
            zIndex: 3000, 
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
              backdropFilter: "blur(20px)",
              padding: "40px",
              borderRadius: "30px",
              width: "90%",
              maxWidth: "380px",
              textAlign: "center",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              color: "white",
              animation: "fadeIn 0.3s ease-in-out"
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>👋</div>
            <h3 style={{ color: "#facc15", marginBottom: "15px", fontSize: "1.6rem" }}>
              Ready to Leave?
            </h3>
            <p style={{ marginBottom: "25px", opacity: 0.9 }}>
              Are you sure you want to log out from FutureMinds?
            </p>

            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
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

export default Navbar;