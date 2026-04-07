import { useState, useEffect } from "react";
import API from "../API";
import { useNavigate } from "react-router-dom";
//import "../Admin/css/Coursecontent.css";
import "./cours.css";
import Swal from "sweetalert2";

export default function Coursepage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("");
  const [category, setCategory] = useState("All");
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";
  const [totalCourses, setTotalCourses] = useState(0);

  const fetchCourses = async () => {
    try {
      let url = "/courses";
      if (module.trim() !== "") url = `/courses/${module}`;
      else if (search.trim() !== "") url = `/courses/title/${search}`;
      else if (category !== "All") url = `/courses/category/${category}`;

      const res = await API.get(url);
      setCourses(
        res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : [],
      );
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    }
  };

  const fetchTotalCount = async () => {
    try {
      const res = await API.get("/courses/count-all");
      setTotalCourses(res.data.total_courses);
    } catch (err) {
      console.error("Error fetching count:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTotalCount();
  }, [category, search, module]);

  const handleEditCourse = async (courseCode) => {
    const course = courses.find((c) => c.course_code === courseCode);
    if (!course) return;

    // Image URL ekakda nathnam file name ekakda kiyala check kirima
    const currentImageUrl = course.course_img?.startsWith("http")
      ? course.course_img
      : `${API.defaults.baseURL}/uploads/${course.course_img}`; // Backend upload path eka danna

    const { value: formValues } = await Swal.fire({
      title: `<span style="color: #00d2ff">Edit Course: ${courseCode}</span>`,
      background: "#1e1e2f",
      color: "#fff",
      html: `
      <div style="text-align: left; font-family: sans-serif; display: flex; flex-direction: column; gap: 10px;">
        
        <div style="text-align: center; margin-bottom: 10px;">
          <label style="font-size: 12px; color: #aaa; display: block; margin-bottom: 5px;">Current Image Preview</label>
          <img src="${currentImageUrl}" alt="course" style="width: 120px; height: 80px; border-radius: 8px; object-fit: cover; border: 1px solid #444;">
        </div>

        <label style="font-size: 14px; color: #aaa;">Course Title</label>
        <input id="swal-title" class="swal2-input" value="${course.title}" style="width: 85%; margin: 5px auto;">

        <label style="font-size: 14px; color: #aaa;">Description</label>
        <textarea id="swal-desc" class="swal2-textarea" style="width: 85%; margin: 5px auto;">${course.descriptions}</textarea>
        
        <label style="font-size: 14px; color: #aaa;">Price (LKR)</label>
        <input id="swal-price" type="number" class="swal2-input" value="${course.price}" style="width: 85%; margin: 5px auto;">
        
        <label style="font-size: 14px; color: #aaa;">Update Image (URL or Upload)</label>
        <input id="swal-imgurl" class="swal2-input" placeholder="Paste Image URL here" value="${course.course_img?.startsWith("http") ? course.course_img : ""}" style="width: 85%; margin: 5px auto;">
        
        <div style="width: 85%; margin: 10px auto; border: 1px dashed #555; padding: 10px; border-radius: 5px;">
           <span style="font-size: 12px; color: #00d2ff;">Or Upload File:</span>
           <input id="swal-file" type="file" accept="image/*" style="font-size: 12px; margin-top: 5px; color: #ccc;">
        </div>
      </div>
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "UPDATE",
      confirmButtonColor: "#00d2ff",
      preConfirm: () => {
        return {
          title: document.getElementById("swal-title").value,
          descriptions: document.getElementById("swal-desc").value,
          price: document.getElementById("swal-price").value,
          image_url: document.getElementById("swal-imgurl").value,
          image_file: document.getElementById("swal-file").files[0],
        };
      },
    });

    if (formValues) {
      try {
        const formData = new FormData();
        formData.append("title", formValues.title);
        formData.append("descriptions", formValues.descriptions);
        formData.append("price", formValues.price);
        formData.append("category", course.category);

        // File ekak thiyenawanam eka yawanawa, nathnam URL eka yawanawa
        if (formValues.image_file) {
          formData.append("course_img", formValues.image_file);
        } else {
          formData.append("image_url", formValues.image_url);
        }

        const res = await API.put(`/courses/update/${courseCode}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Updated!",
            background: "#1e1e2f",
            color: "#fff",
            timer: 1500,
          });
          fetchCourses();
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          background: "#1e1e2f",
          color: "#fff",
        });
      }
    }
  };

  const handleDelete = async (courseCode) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete course ${courseCode}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff4d4d",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/courses/delete/${courseCode}`);
          Swal.fire({
            title: "Deleted!",
            icon: "success",
            background: "#1a1a1a",
            color: "#fff",
            timer: 2000,
          });
          fetchCourses();
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  return (
    <div className="admin-main-content" style={{ marginRight: "100px" }}>
      <h1
        className="dashboard-title-text"
        style={{ marginTop: "40px", paddingBottom: "30px" }}
      >
        Course Management
      </h1>
      <div
        style={{
          marginLeft: "900px",
          marginBottom: "50px",
          fontSize: "18px",
          fontWeight: "bold",
          color: "#00d2ff",
          marginTop: "-60px",
        }}
      >
        Total Courses:{" "}
        <span
          style={{
            color: "#fff",
            background: "#333",
            padding: "5px 12px",
            borderRadius: "20px",
          }}
        >
          {totalCourses}
        </span>
      </div>

      <div className="search-container" style={{ marginLeft: "100px" }}>
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
          <span>📂</span>
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

      <div className="course-category-section-conatiner">
        <section>
          <div
            className="acourse-grid"
            style={{ paddingBottom: "30px", paddingRight: "30px" }}
          >
            <div
              className="course-card aadd-new-card"
              onClick={() => navigate("/add-course")}
            >
              <div className="plus-icon">+</div>
              <h3>Add New Course</h3>
            </div>

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
                    <h3>{course.course_code}</h3>
                    {/*
                    <div className="course-footer">
                      <span className="price">LKR {course.price}</span>
                    </div> */}
                    <div className="course-footer">
                      <span className="course-price">LKR {course.price}</span>
                      <div
                        style={{
                          display: "flex",
                          gap: "5px",
                          alignItems: "center",
                        }}
                      >
                        <button
                          onClick={() =>
                            navigate(`/a-course-content/${course.course_code}`)
                          }
                          className="course-view-btn"
                        >
                          View
                        </button>

                        <button
                          onClick={() => handleDelete(course.course_code)}
                          className="course-view-btn"
                        >
                          Delete
                        </button>

                        <button
                        className="edit-icon-btn"
                          onClick={() => handleEditCourse(course.course_code)}
                          title="Edit Course"
                        >
                          ✏️
                        </button>
                      </div>
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

      <button
        className="floating-back-btn"
        onClick={() => navigate("/a-dashbord")}
      >
        ← BACK TO DASHBOARD
      </button>
    </div>
  );
}
