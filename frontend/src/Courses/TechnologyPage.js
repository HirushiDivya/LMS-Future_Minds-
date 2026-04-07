import { useState, useEffect } from "react";
import API from "../API";
import { useNavigate } from "react-router-dom";
import "./Studentcoursecontent.css";
//Course -> Technology Page
export default function TechPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchTechCourses = async () => {
    try {
      let url = search.trim() !== "" ? `/courses/title/${search}` : "/courses/technology";
      const res = await API.get(url);
      let data = res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : [];
      
      if (search.trim() !== "") {
        data = data.filter(c => c.category === 'Technology');
      }
      setCourses(data);
    } catch (err) {
      console.error("Error fetching tech courses:", err);
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchTechCourses();
  }, [search]);

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Technology Courses</h1>

      <div className="search-container">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search Technology Courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="category-section-container">
        <div className="course-grid-row">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <span className="course-code">{course.course_code}</span>
              <h3>{course.title}</h3>
              <p>{course.descriptions?.substring(0, 80)}...</p>
              <div className="course-footer">
                <span className="course-price">LKR {course.price}</span>
                <button onClick={() => navigate(`/s-course-content/${course.course_code}`)} className="view-btn">
                  View Content
                </button>
              </div>
            </div>
          ))}
        </div>
        {courses.length === 0 && <p className="no-courses-msg">No Technology courses found.</p>}
      </div>
    </div>
  );
}