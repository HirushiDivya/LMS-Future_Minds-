import { useState, useEffect } from "react";
import API from "../API";
import { useNavigate } from "react-router-dom";
//import "./Studentcoursecontent.css";
import "./Course.css";

export default function Coursepage() {
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [courses, setCourses] = useState([]); //course list
  const [search, setSearch] = useState(""); //title-search
  const [module, setModule] = useState(""); //module code
  const [category, setCategory] = useState("All");

  const BASE_URL = "http://localhost:5000"; // ඔබේ backend port එක 5000 නම්

  const categories =
    category === "All" ? ["Science", "Technology", "Mathematics"] : [category];

  //search course by course category -science,technology,physics
  //deta retrieve from backend- async- wait
  //trim() - remove emty spaces
  //!== not empty
  const fetchCourses = async () => {
    try {
      let url = "/courses";
      if (module.trim() !== "") url = `/courses/${module}`;
      else if (search.trim() !== "") url = `/courses/title/${search}`;
      else if (category !== "All") url = `/courses/category/${category}`;

      //ask data from backend
      const res = await API.get(url);
      const baseCourses = res.data
        ? Array.isArray(res.data)
          ? res.data
          : [res.data]
        : [];

      const coursesWithFullDetails = await Promise.all(
        baseCourses.map(async (course) => {
          try {
            // Student count
            const countRes = await API.get(
              `/courses/count-students/${course.id}`,
            );

            // random rating 2-5
            const randomRating = (Math.random() * (5 - 2) + 2).toFixed(1);

            return {
              ...course,
              students: countRes.data.total_enrolled,
              rating: randomRating,
            };
          } catch (err) {
            // Individual course error - default
            return {
              ...course,
              students: 0,
              rating: (Math.random() * (5 - 2) + 2).toFixed(1),
            };
          }
        }),
      );

      setCourses(coursesWithFullDetails);
    } catch (err) {
      // if whole fetch process become error
      console.error("Error fetching courses", err);
      setCourses([]);
    }
  };


   const handleViewContent = (courseCode) => {
    navigate(`/s-course-content/${courseCode}`);
  };

  //react hook - real time updates happen
  useEffect(() => {
    fetchCourses();
  }, [category, search, module]);

  //cat = category(science,tech,maths)
  const handleViewMore = (cat) => {
    if (cat == "Science") {
      navigate("/science-page");
    } else if (cat == "Technology") {
      navigate("/tech-page");
    } else if (cat == "Mathematics") {
      navigate("/math-page");
    }
  };
 
  return ( 
    <div className="coursedashboard-page">
       <h3 className= "about-title" style={{paddingTop : "0px", marginTop :"10px", paddingBottom: "20px"}}>
            Explore <span className="highlight">{category}</span> Courses
          </h3>
      <div className="coursepagesearch-container">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search Title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setModule("");
            }}
          />
        </div>

        <div className="search-box">
          <span>🆔</span>
          <input
            type="text"
            placeholder="Module Code..."
            value={module}
            onChange={(e) => {
              setModule(e.target.value);
              setSearch("");
            }}
          />
        </div>

        <div className="search-boxx">
         {/* <span>📂</span> */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setModule("");
              setSearch("");
            }}
          > 
            <option value="All">All Categories</option>
            <option value="Science">Science</option>
            <option value="Technology">Technology</option>
            <option value="Mathematics">Mathematics</option>
          </select>
        </div>
      </div>

      {/* courses  */}

      <div className="course-category-section-conatiner">
        <section>
         
 
          <div className="courses-grid" style={{paddingBottom: "30px"}}>
            {/* categories.map වෙනුවට කෙලින්ම courses.map භාවිතා කරන්න */}
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="coursepge-card">
                  <div className="course-badge">
                    <span>{course.category}</span>
                  </div>
                  <img
                    src={
                      course.course_img
                        ? course.course_img.startsWith("http")
                          ? course.course_img // Web link එකක් නම් කෙලින්ම පෙන්වන්න
                          : `${BASE_URL}/uploads/${course.course_img}` // Local upload එකක් නම් path එක හදන්න
                         : "https://via.placeholder.com/300x200?text=No+Image"
                    }
                    alt={course.title}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x200?text=Error+Loading";
                    }}
                  />
                  <div className="course-content">
                    <div className="course-meta">
                      <span>⭐ {(Math.random() * (5 - 2) + 2).toFixed(1)}</span>
                      <span>👥 {course.students}k Students</span>
                    </div>

                    <h3>{course.title}</h3>

                    <div className="course-footer">
                      <span className="price">LKR {course.price}</span>
                      <button
                        className="buy-btn"
                        onClick={() => handleViewContent(course.course_code)}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No courses found.</p>
            )}
          </div>
        </section>

        {courses.length === 0 && (
          <p className="no-courses-msg">
            No courses found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
}
