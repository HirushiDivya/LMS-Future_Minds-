import React, { useState } from "react";
import API from "../API";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Alert 
import "../Admin/css/Coursecontent.css";

const AddQuiz = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [quizData, setQuizData] = useState({
    title: "",
    qdescription: "",
    expires_at: "",
    time_limit_minutes: "",
    price: "",
    course_id: "",
  });

  const [file, setFile] = useState(null);

  // Data type function 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const quizRes = await API.post("/admin/create-quiz", quizData);
      const quizId = quizRes.data.quizId;

      if (quizId && file) {
        const formData = new FormData();
        formData.append("file", file);

        await API.post(`/admin/upload-questions/${quizId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Quiz and Questions uploaded successfully!',
          confirmButtonColor: '#00d2ff'
        }).then(() => navigate("/a-quiz"));

      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Quiz Created',
          text: 'Quiz created, but no CSV file was uploaded.',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Error creating quiz. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="students-container">
      <h2 className="dashboard-title">Create New Quiz</h2>

      <div className="table-responsive glass-effect" style={{ maxWidth: "800px", margin: "0 auto", padding: "30px" }}>
        
        <form onSubmit={handleSubmit} className="quiz-form">
          <div className="form-group-custom">
            <label>Quiz Title</label>
            <input
              type="text"
              name="title"
              className="full-width"
              placeholder="Enter Quiz Title"
              required
              value={quizData.title} // State bind 
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group-custom">
            <label>Description</label>
            <textarea
              name="qdescription"
              placeholder="Enter Quiz Description"
              rows="3"
              value={quizData.qdescription}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                color: "#333",
                fontSize: "1rem",
                marginTop: "8px",
                display: "block"
              }}
            ></textarea>
          </div>

          <div className="form-row-custom" style={{ display: "flex", gap: "15px" }}>
            <div className="form-group-custom" style={{ flex: 1 }}>
              <label>Time Limit (Min)</label>
              <input
                type="number"
                name="time_limit_minutes"
                className="full-width"
                required
                value={quizData.time_limit_minutes}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group-custom" style={{ flex: 1 }}>
              <label>Price (Rs.)</label>
              <input
                type="number"
                name="price"
                className="full-width"
                required
                value={quizData.price}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row-custom" style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
            <div className="form-group-custom" style={{ flex: 1 }}>
              <label>Course ID</label>
              <input
                type="number"
                name="course_id"
                className="full-width"
                required
                value={quizData.course_id}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group-custom" style={{ flex: 1 }}>
              <label>Expiry Date</label>
              <input
                type="date"
                name="expires_at"
                className="full-width"
                required
                value={quizData.expires_at}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="file-upload-section" style={{ marginTop: "20px", border: "1px dashed #ccc", padding: "15px", borderRadius: "8px" }}>
            <label style={{ display: "block", marginBottom: "10px" }}>Upload Questions (CSV File)</label>
            <input
              type="file"
              accept=".csv"
              required
              onChange={handleFileChange}
              style={{ position: "static", opacity: 1 }} // File input fixed 
            />
            <p className="helper-text" style={{ fontSize: "0.8rem", color: "#eee", marginTop: "10px" }}>
              Required Columns: question, a, a_desc, b, b_desc, c, c_desc, d, d_desc, correct
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="save-btn" 
            style={{ width: "100%", marginTop: "25px", padding: "12px", cursor: "pointer" }}
          >
            {loading ? "Processing..." : "CREATE QUIZ & UPLOAD CSV"}
          </button>
        </form>
      </div>
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/a-dashbord')}
        style={{
          position: "fixed", bottom: "30px", right: "30px", padding: "12px 30px",
          borderRadius: "30px", background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.3)",
          cursor: "pointer", fontWeight: "bold"
        }}
      >
        ← BACK TO DASHBOARD
      </button>
    </div>
  );
};

export default AddQuiz;