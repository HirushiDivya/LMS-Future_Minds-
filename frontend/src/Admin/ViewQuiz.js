import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ViewQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // States
  const [quizData, setQuizData] = useState(null); // Quiz + Questions data
  const [editQuiz, setEditQuiz] = useState(null);
  const [editQuestion, setEditQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizInfo, setQuizInfo] = useState({ title: "", questions_count: 0 });
  // 1. Fetch Quiz and Questions (Single API Call)
  const fetchFullQuiz = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/quiz/${id}`);
      setQuizData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching quiz data", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullQuiz();
  }, [id]);

  // Update Quiz Header
  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/admin/quiz/update-quiz/${id}`,
        editQuiz,
      );
      alert("Quiz Updated!");
      setEditQuiz(null);
      fetchFullQuiz();
    } catch (err) {
      alert("Update failed");
    }
  };

  // Update Specific Question
  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/admin/update-question/${editQuestion.id}`,
        editQuestion,
      );
      alert("Question Updated!");
      setEditQuestion(null);
      fetchFullQuiz();
    } catch (err) {
      alert("Update failed");
    }
  };

  if (loading)
    return (
      <div className="students-container">
        <h2>Loading Data...</h2>
      </div>
    );
  if (!quizData)
    return (
      <div className="students-container">
        <h2>Quiz Not Found</h2>
      </div>
    );



  

  return (
    <div className="students-container">
      <h2>Update Quiz: {quizData.title}</h2>

      {/* Table 1: Quiz Main Details */}
      <div className="table-responsive" style={{ marginBottom: "40px" }}>
        <h3 style={{ color: "var(--text-bold)", paddingBottom: "10px" }}>
          Quiz Header Info
        </h3>
        <table className="students-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
               <th>Questions</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>QUIZ</strong>
              </td>
              <td>{quizData.title}</td>
              <td>{quizData.questions_count} </td> 
              <td>Rs. {quizData.price}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table 2: Quiz Questions List */}
      <div className="table-responsive">
        <h3 style={{ color: "var(--text-bold)", paddingBottom: "10px" }}>
          Questions List
        </h3>
        <table className="students-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>ID</th>
              <th>Question</th>
              <th>Answers (A,B,C,D)</th>
              <th>Correct</th>
            </tr>
          </thead>
          <tbody>
            {quizData.questions &&
              quizData.questions.map((q) => (
                <tr key={q.id}>
                  <td>
                    <strong>QUESTION</strong>
                  </td>
                  <td>{q.id}</td>
                  <td style={{ maxWidth: "250px" }}>{q.question_text}</td>
                  <td style={{ fontSize: "0.85rem", color: "#666" }}>
                    A: {q.option_a.substring(0, 20)}... <br />
                    B: {q.option_b.substring(0, 20)}... <br />
                    A: {q.option_c.substring(0, 20)}... <br />
                    B: {q.option_d.substring(0, 20)}...
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      color: "#16a34a",
                      fontWeight: "bold",
                    }}
                  >
                    {q.correct_option}
                  </td>
                  <td></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* --- Quiz Edit Modal --- */}

      {/* --- Question Edit Modal --- */}
      {editQuestion && (
        <div className="modal">
          <div className="glass-effect" style={{ width: "550px" }}>
            <h3>Update Question Details</h3>
            <form onSubmit={handleUpdateQuestion}>
              <textarea
                className="search-input"
                style={{
                  width: "90%",
                  height: "70px",
                  marginBottom: "10px",
                  borderRadius: "10px",
                }}
                value={editQuestion.question_text}
                onChange={(e) =>
                  setEditQuestion({
                    ...editQuestion,
                    question_text: e.target.value,
                  })
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <input
                  className="search-input"
                  style={{ width: "85%" }}
                  value={editQuestion.option_a}
                  onChange={(e) =>
                    setEditQuestion({
                      ...editQuestion,
                      option_a: e.target.value,
                    })
                  }
                />
                <input
                  className="search-input"
                  style={{ width: "85%" }}
                  value={editQuestion.option_b}
                  onChange={(e) =>
                    setEditQuestion({
                      ...editQuestion,
                      option_b: e.target.value,
                    })
                  }
                />
                <input
                  className="search-input"
                  style={{ width: "85%" }}
                  value={editQuestion.option_c}
                  onChange={(e) =>
                    setEditQuestion({
                      ...editQuestion,
                      option_c: e.target.value,
                    })
                  }
                />
                <input
                  className="search-input"
                  style={{ width: "85%" }}
                  value={editQuestion.option_d}
                  onChange={(e) =>
                    setEditQuestion({
                      ...editQuestion,
                      option_d: e.target.value,
                    })
                  }
                />
              </div>
              <select
                className="search-input"
                style={{ width: "95%", marginTop: "10px" }}
                value={editQuestion.correct_option}
                onChange={(e) =>
                  setEditQuestion({
                    ...editQuestion,
                    correct_option: e.target.value,
                  })
                }
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
              <button type="submit" className="save-btn">
                UPDATE QUESTION
              </button>
              <button
                type="button"
                className="save-btn delete-btn"
                onClick={() => setEditQuestion(null)}
              >
                CANCEL
              </button>
            </form>
          </div>
        </div>
      )}

      
      <button
        className="view-btn"
        onClick={() => navigate(-1)}
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
        ← BACK TO LIST
      </button>
    </div>
    
  );
};

export default ViewQuiz;
