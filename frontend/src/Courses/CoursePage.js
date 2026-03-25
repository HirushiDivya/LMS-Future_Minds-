import { useState, useEffect } from "react";
import API from "../API";
import { useNavigate } from "react-router-dom";
import "./Studentcoursecontent.css";

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
    navigate(`/s-course-content/${courseCode}`);
  };

  // View More ක්ලික් කළ විට category එක අනුව අදාළ page එකට යැවීමේ logic එක
  const handleViewMore = (cat) => {
    if (cat === "Science") {
      navigate("/science-page");
    } else if (cat === "Technology") {
      navigate("/tech-page");
    } else if (cat === "Mathematics") {
      navigate("/math-page");
    }
  };

  const categories = category === "All" ? ["Science", "Technology", "Mathematics"] : [category];

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Courses</h1>

      {/* Search & Filter Section */}
      <div className="search-container">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search Title..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setModule(""); }}
          />
        </div>

        <div className="search-box">
          <span>🆔</span>
          <input
            type="text"
            placeholder="Module Code..."
            value={module}
            onChange={(e) => { setModule(e.target.value); setSearch(""); }}
          />
        </div>

        <div className="search-box">
          <span>📂</span>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setModule(""); setSearch(""); }}
          >
            <option value="All">All Categories</option>
            <option value="Science">Science</option>
            <option value="Technology">Technology</option>
            <option value="Mathematics">Mathematics</option>
          </select>
        </div>
      </div>

      <div className="category-section-container">
        {categories.map((cat) => {
          // මෙහිදී filter කිරීම නිවැරදිව සිදු කර ඇත
          const filteredCourses = courses.filter(c => c.category === cat);
          
          if (filteredCourses.length === 0 && category !== "All") return null;

          return (
            <div key={cat} className="category-row-wrapper">
              <h2 className="category-row-title">{cat}</h2>
              <div className="course-grid-row">
                {/* මුල් කාඩ් 3 පෙන්වීමට */}
                {filteredCourses.slice(0, 3).map((course) => (
                  <div key={course.id} className="course-card">
                    <span className="course-code">{course.course_code}</span>
                    <h3>{course.title}</h3>
                    <p>{course.descriptions?.substring(0, 80)}...</p>
                    <div className="course-footer">
                      <span className="course-price">LKR {course.price}</span>
                      <button onClick={() => handleViewContent(course.course_code)} className="view-btn">
                        View Content
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Dynamic View More Card */}
                {filteredCourses.length > 0 && (
                  <div className="course-card view-more-card" onClick={() => handleViewMore(cat)}>
                    <div className="view-more-content">
                      <h3>View More</h3>
                      <p>Explore all {cat} courses</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {courses.length === 0 && (
          <p className="no-courses-msg">No courses found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}