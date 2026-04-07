import React, { useState, useEffect } from "react";
import API from "../API";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./cours.css";

const AQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";
  const [totalQuizzes, setTotalQuizzes] = useState(0);

  const fetchQuizzes = async () => {
    try {
      const res = await API.get("/admin/all-quizzes");
      setQuizzes(res.data || []);
    } catch (err) {
      console.error("Error fetching quizzes", err);
      setQuizzes([]);
    }
  }; 

  const fetchTotalCount = async () => {
    try {
      const res = await API.get("/quiz/quiz-count");
      setTotalQuizzes(res.data.total_quizzes);
    } catch (err) {
      console.error("Error fetching quiz count:", err);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchTotalCount();
  }, []);
  //   Advanced Delete Function
  const handleDeleteQuiz = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(0,0,123,0.4)`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Deleting state -loading
          Swal.fire({
            title: "Deleting...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          await API.delete(`/quiz/delete-quiz/${id}`);

          // Success message
          Swal.fire({
            title: "Deleted!",
            text: "The quiz has been deleted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });

          fetchQuizzes(); // Refresh the list
        } catch (err) {
          // Error message
          Swal.fire({
            title: "Error!",
            text: "Something went wrong while deleting.",
            icon: "error",
          });
        }
      }
    });
  };

  const filteredQuizzes = quizzes.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleEditQuiz = async (quiz) => {
    // url for disply exist image
    const currentImageUrl = quiz.Quiz_IMG?.startsWith("http")
      ? quiz.Quiz_IMG
      : `${BASE_URL}/uploads/${quiz.Quiz_IMG}`;

    const { value: formValues } = await Swal.fire({
      title: `<span style="color: #00d2ff">Edit Quiz: ${quiz.title}</span>`,
      background: "#1e1e2f",
      color: "#fff",
      width: "450px",
      html: `
      <div style="text-align: left; font-family: sans-serif; display: flex; flex-direction: column; gap: 8px;">
        
        <div style="text-align: center; margin-bottom: 10px;">
          <label style="font-size: 12px; color: #aaa; display: block; margin-bottom: 5px;">Current Image Preview</label>
          <img src="${currentImageUrl}" alt="quiz" style="width: 120px; height: 80px; border-radius: 8px; object-fit: cover; border: 1px solid #444;" 
               onerror="this.src='https://via.placeholder.com/120x80?text=No+Image'">
        </div>

        <label style="font-size: 14px; color: #aaa;">Quiz Title</label>
        <input id="swal-title" class="swal2-input" value="${quiz.title}" style="width: 85%; margin: 5px auto; background: #2a2a3d; color: #fff; border: 1px solid #444;">

        <label style="font-size: 14px; color: #aaa;">Description</label>
        <textarea id="swal-desc" class="swal2-textarea" style="width: 85%; margin: 5px auto; background: #2a2a3d; color: #fff; border: 1px solid #444; height: 70px;">${quiz.qdescription || ""}</textarea>
        
        <div style="display: flex; justify-content: space-between; width: 90%; margin: 0 auto;">
           <div style="width: 45%;">
              <label style="font-size: 13px; color: #aaa;">Time (Mins)</label>
              <input id="swal-time" type="number" class="swal2-input" value="${quiz.time_limit_minutes}" style="width: 100%; margin: 5px 0; background: #2a2a3d; color: #fff; border: 1px solid #444;">
           </div>
           <div style="width: 45%;">
              <label style="font-size: 13px; color: #aaa;">Price (LKR)</label>
              <input id="swal-price" type="number" class="swal2-input" value="${quiz.price}" style="width: 100%; margin: 5px 0; background: #2a2a3d; color: #fff; border: 1px solid #444;">
           </div>
        </div>

        <label style="font-size: 14px; color: #aaa;">Course ID</label>
        <input id="swal-courseid" class="swal2-input" value="${quiz.course_id}" style="width: 85%; margin: 5px auto; background: #2a2a3d; color: #fff; border: 1px solid #444;">
        
        <label style="font-size: 14px; color: #aaa;">Update Image (URL or Upload)</label>
        <input id="swal-imgurl" class="swal2-input" placeholder="Paste Image URL here" value="${quiz.Quiz_IMG?.startsWith("http") ? quiz.Quiz_IMG : ""}" style="width: 85%; margin: 5px auto; background: #2a2a3d; color: #fff; border: 1px solid #444;">
        
        <div style="width: 85%; margin: 10px auto; border: 1px dashed #555; padding: 10px; border-radius: 5px; background: #252538;">
           <span style="font-size: 12px; color: #00d2ff;">Or Upload File:</span>
           <input id="swal-file" type="file" accept="image/*" style="font-size: 12px; margin-top: 5px; color: #ccc; display: block;">
        </div>
      </div>
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "UPDATE",
      confirmButtonColor: "#00d2ff",
      cancelButtonColor: "#444",
      preConfirm: () => {
        return {
          title: document.getElementById("swal-title").value,
          qdescription: document.getElementById("swal-desc").value,
          time_limit_minutes: document.getElementById("swal-time").value,
          price: document.getElementById("swal-price").value,
          course_id: document.getElementById("swal-courseid").value,
          image_url: document.getElementById("swal-imgurl").value,
          image_file: document.getElementById("swal-file").files[0],
        };
      },
    });

    if (formValues) {
      try {
        // Loading spinner
        Swal.fire({
          title: "Updating...",
          background: "#1e1e2f",
          color: "#fff",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const formData = new FormData();
        formData.append("title", formValues.title);
        formData.append("qdescription", formValues.qdescription);
        formData.append("time_limit_minutes", formValues.time_limit_minutes);
        formData.append("price", formValues.price);
        formData.append("course_id", formValues.course_id);

        // if select file send it or keep exist one
        if (formValues.image_file) {
          formData.append("Quiz_IMG", formValues.image_file);
        } else if (formValues.image_url) {
          formData.append("image_url", formValues.image_url);
        } else {
          formData.append("Quiz_IMG", quiz.Quiz_IMG);
        }

        // Backend route -> PUT request
        const res = await API.put(`/quiz/update-quiz/${quiz.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "Quiz updated successfully.",
            background: "#1e1e2f",
            color: "#fff",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchQuizzes(); // List refresh
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: err.response?.data?.error || "Something went wrong.",
          background: "#1e1e2f",
          color: "#fff",
        });
      }
    }
  };

  return (
    <div className="admin-main-content">
      <h1
        className="dashboard-title-text"
        style={{ marginTop: "40px", paddingBottom: "30px" }}
      >
        All Quizes
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
        Total Quizzes:{" "}
        <span
          style={{
            color: "#fff",
            background: "#333",
            padding: "5px 12px",
            borderRadius: "20px",
          }}
        >
          {totalQuizzes}
        </span>
      </div>

      {message && <div className="status-message">{message}</div>}

      <div className="search-container" style={{ marginLeft: "100px" }}>
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search Quiz Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="acourse-grid">
        {/* ADD NEW QUIZ CARD */}
        <div
          className="course-card aadd-new-card"
          onClick={() => navigate("/add-quiz")}
        >
          <div className="plus-icon">+</div>
          <h3>Add New Quiz</h3>
        </div>

        {filteredQuizzes.map((quiz) => (
          <div key={quiz.id} className="coursepge-card">
            <div className="image-container">
              <img
                src={
                  quiz.Quiz_IMG
                    ? quiz.Quiz_IMG.startsWith("http")
                      ? quiz.Quiz_IMG
                      : `${BASE_URL}/uploads/${quiz.Quiz_IMG}`
                    : "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={quiz.title}
                className="quiz-card-img"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=Error";
                }}
              />
            </div>

            <div className="card-body">
              <div className="course-meta" style={{ marginTop: "20px" }}>
                <span>⭐ 4.8</span>
                <span>👥 1.2k Students</span>
              </div>

              <h3>{quiz.title}</h3>
              <p className="course-id-text">Course ID: {quiz.course_id}</p>

              <div className="course-footer">
                <span className="course-price" style={{ marginLeft: "6px" }}>
                  LKR {quiz.price}
                </span>
                <div className="action-buttons">
                  <button
                    className="edit-icon-btn"
                    onClick={() => handleEditQuiz(quiz)}
                  >
                    ✏️
                  </button>
                  <button
                    className="course-view-btn"
                    style={{ marginBottom: "10px", marginRight: "5px" }}
                    onClick={() => navigate(`/a-updatequiz/${quiz.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="course-view-btn"
                    onClick={() => handleDeleteQuiz(quiz.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="floating-back-btn"
        onClick={() => navigate("/a-dashbord")}
      >
        ← BACK TO DASHBOARD
      </button>
    </div>
  );
};

export default AQuiz;
