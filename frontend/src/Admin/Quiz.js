import React, { useState, useEffect } from "react";
import API from "../API"; // axios වෙනුවට ඔබේ API instance එක භාවිතා කරයි
import { useNavigate } from "react-router-dom";
import "../Admin/css/Coursecontent.css"; // අදාළ CSS ගොනුව එක් කරන්න

const AQuiz = () => {
  // State management
  const [quizzes, setQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch All Quizzes
  const fetchQuizzes = async () => {
    try {
      // ඔබේ API එකට අනුව URL එක වෙනස් කරගන්න (උදා: /admin/all-quizzes)
      const res = await API.get("/admin/all-quizzes");
      setQuizzes(res.data || []);
    } catch (err) {
      console.error("Error fetching quizzes", err);
      setQuizzes([]);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Action Handlers
  const handleDeleteQuiz = async (id) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await API.delete(`/admin/delete-quiz/${id}`);
        setMessage("Quiz deleted successfully!");
        fetchQuizzes();
      } catch (err) {
        setMessage("Error deleting quiz.");
      }
    }
  };

  const filteredQuizzes = quizzes.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Quiz Management</h1>

      {message && (
        <div style={{ textAlign: "center", color: "#ffeb3b", marginBottom: "20px" }}>
          {message}
        </div>
      )}

      {/* Search & Action Section */}
      <div className="search-container">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search Quiz Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Payment Approval සඳහා Quick Link එකක් අවශ්‍ය නම් මෙතැනට දැමිය හැක */}
      </div>

      {/* Grid Display */}
      <div className="course-grid">
        
        {/* --- ADD NEW QUIZ CARD --- */}
        <div 
          className="course-card add-new-card" 
          onClick={() => navigate("/add-quiz")} // නව Quiz එකක් සෑදීමට වෙනම පිටුවකට navigate කිරීම
          style={{ border: "2px dashed #007bff", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "220px" }}
        >
          <div style={{ fontSize: "50px", color: "#007bff" }}>+</div>
          <h3 style={{ color: "#007bff" }}>Create New Quiz</h3>
          <p style={{ textAlign: "center", fontSize: "14px" }}>Click to add a new quiz & upload CSV</p>
        </div>

        {/* --- EXISTING QUIZZES --- */}
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="course-card">
              <h3>{quiz.title}</h3>
              <span className="course-code">Quiz ID: {quiz.id}</span>
              <p>Course ID: {quiz.course_id}</p>
              
              <div className="course-footer">
                <span className="course-price">Rs. {quiz.price}</span>
                <div style={{ display: "flex", gap: "5px" }}>
                    <button 
                        onClick={() => navigate(`/a-viewquiz/${quiz.id}`)} 
                        className="view-btn"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                    >
                        View
                    </button>
                    <button 
                        onClick={() => navigate(`/a-updatequiz/${quiz.id}`)} 
                        className="view-btn"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => handleDeleteQuiz(quiz.id)} 
                        className="view-btn"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                    >
                        Delete
                    </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: "1/-1", textAlign: "center", opacity: 0.7 }}>No quizzes found.</p>
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
          background: "rgba(255, 255, 255, 0.2)", // Glass effect එකට ගැලපෙන ලෙස
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          fontSize: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => (e.target.style.background = "#00d2ff")} // Hover කරන විට පාට වෙනස් වීමට
        onMouseOut={(e) =>
          (e.target.style.background = "rgba(255, 255, 255, 0.2)")
        }
      >
        ← BACK TO DASHBORD
      </button>
      
    </div>
  );
};

export default AQuiz;