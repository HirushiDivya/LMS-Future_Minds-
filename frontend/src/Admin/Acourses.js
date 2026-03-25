import { useState, useEffect } from "react";
import API from "../API";
import { useNavigate } from "react-router-dom";
import "../Admin/css/Coursecontent.css";

export default function Coursepage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("");
  const [category, setCategory] = useState("All");
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      let url = "/courses";
      if (module.trim() !== "") url = `/courses/${module}`;
      else if (search.trim() !== "") url = `/courses/title/${search}`;
      else if (category !== "All") url = `/courses/category/${category}`;

      const res = await API.get(url);
      setCourses(res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [category, search, module]);

  const handleViewContent = (courseCode) => {
    navigate(`/a-course-content/${courseCode}`);
  };

  // navigate to Add New Course page  
  const handleAddNewCourse = () => {
    navigate("/add-course");
  };

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Course Management</h1>

      {/* Search & Filter Section */}
      <div className="search-container">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search Title..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setModule("");}}
          />
        </div>

        <div className="search-box">
          <span>🆔</span>
          <input
            type="text"
            placeholder="Module Code..."
            value={module}
            onChange={(e) => {setModule(e.target.value); setSearch("");}}
          />
        </div>

        <div className="search-box">
          <span>📂</span>
          <select 
            value={category}
            onChange={(e) => {setCategory(e.target.value); setModule(""); setSearch("");}}
          >
            <option value="All">All Categories</option>
            <option value="Science">Science</option>
            <option value="Technology">Technology</option>
            <option value="Mathematics">Mathematics</option>
          </select>
        </div>
      </div>

      {/* Grid Display */}
      <div className="course-grid">
        
        {/* --- ADD NEW COURSE CARD --- */}
        <div className="course-card add-new-card" onClick={handleAddNewCourse} style={{ border: "2px dashed #007bff", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <div style={{ fontSize: "50px", color: "#007bff" }}>+</div>
          <h3 style={{ color: "#007bff" }}>Add New Course</h3>
          <p style={{ textAlign: "center", fontSize: "14px" }}>Click here to create a new course module</p>
        </div>

        {/* --- EXISTING COURSES --- */}
        {courses.length > 0 && courses[0] !== null ? (
          courses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <span className="course-code">{course.course_code}</span>
              <p>{course.descriptions}</p>
              
              <div className="course-footer">
                <span className="course-price">LKR {course.price}</span>
                <button 
                  onClick={() => handleViewContent(course.course_code)} 
                  className="view-btn"
                >
                  View Content
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: "1/-1", textAlign: "center", opacity: 0.7 }}>No courses found.</p>
        )}
      </div>
       <button
        className="view-btn"
        onClick={() => navigate('/a-dashbord')}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: "1000",
          padding: "12px 30px",
          borderRadius: "30px",
          background: "rgba(255, 255, 255, 0.2)", // Glass effect 
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          fontSize: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => (e.target.style.background = "#00d2ff")} // Hover 
        onMouseOut={(e) =>
          (e.target.style.background = "rgba(255, 255, 255, 0.2)")
        }
      >
        ← BACK TO DASHBORD
      </button>
    </div>
  );
}