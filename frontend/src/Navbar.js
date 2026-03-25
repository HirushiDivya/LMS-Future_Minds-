import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { FaUser, FaSignOutAlt, FaSun, FaMoon } from "react-icons/fa"; 
import { FaBars, FaTimes } from "react-icons/fa";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // 1. Theme configuration
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
 
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.clear();
      setUserName("");
      navigate("/");
      window.location.reload();
    }
  };

  // Mobile menu එක වසා දැමීම සඳහා භාවිතා කරන function එක
  const closeMenu = () => {
    setIsOpen(false);
  };
  

  return (
    <header className="navbar">
      <div className="container">
        {/* Logo */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <span>▲</span> FutureMinds
        </Link>

        {/* Navigation Links */}
        {/* isOpen true නම් පමණක් "open" class එක ලැබී menu එක දිස්වේ */}
        <nav className={`nav-links ${isOpen ? "open" : ""}`}>
          <NavLink
            to="/home"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu} // Click කළ විට menu එක වැසේ
          >
            Home
          </NavLink>
          <NavLink
            to="/all-courses"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            Courses
          </NavLink>
            <NavLink
            to="/s-allquiz"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            Quizes
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            Contact
          </NavLink>

          {/* Theme Toggle inside Nav */}
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
              <button onClick={handleLogout} className="logout-btn-nav">
                <FaSignOutAlt />
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle (Hamburger Icon) */}
        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          <span className={`bar ${isOpen ? "open" : ""}`}></span>
          <span className={`bar ${isOpen ? "open" : ""}`}></span>
          <span className={`bar ${isOpen ? "open" : ""}`}></span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;