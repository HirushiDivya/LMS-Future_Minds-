import React, { useState, useEffect } from "react";
import API from "../../API";
import { useParams, useNavigate } from "react-router-dom";
import "../StudentRegister.css";

const ViewQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchQuizData();
    }
  }, [id]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const studentId = localStorage.getItem("userID");
      const detailsRes = await API.get(`/quiz/quiz/${id}`);
      setQuizData(detailsRes.data);

      if (studentId) {
        try {
          const questionsRes = await API.get(
            `/quiz/get-questions/${id}?studentId=${studentId}`,
          );
          setQuestions(questionsRes.data);
          setIsApproved(true);
        } catch (err) {
          if (err.response && err.response.status === 403) {
            setIsApproved(false);
          }
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching quiz data:", err);
      setLoading(false);
    }
  };

  const handleEnrollRequest = () => {
  const userId = localStorage.getItem("userID");
  if (!userId) {
    alert("Please login to request access.");
    return;
  }
  
  navigate(`/qpayment`, {
    state: { 
      title: quizData.title, 
      price: quizData.price, 
      id: id,      // මෙහි පොදුවේ 'id' ලෙස යවන්න
      type: "QUIZ" // මෙය ඉතා වැදගත්
    },
  });
};

  if (loading)
    return (
      <div className="register-page">
        <h2 style={{ color: "white" }}>Loading...</h2>
      </div>
    );
  if (!quizData)
    return (
      <div className="register-page">
        <h2 style={{ color: "white" }}>Quiz Not Found</h2>
      </div>
    );

  return (
    <div className="register-page">
      <div
        className="register-card profile-card-widequiz"
        style={{ maxWidth: "800px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <h2 style={{ margin: 0 }}>{quizData.title}</h2>
            <p style={{ margin: 0 }}>
              {isApproved ? "Examination in Progress" : "Access Restricted"}
            </p>
          </div>
          {showQuestions && (
            <button
              onClick={() => setShowQuestions(false)}
              className="mini-navbar button"
              style={{ background: "#ef4444", width: "auto" }}
            >
              ✕ Exit
            </button>
          )}
        </div>

        {!showQuestions ? (
          <>
            {/* Glassy Table Area */}
            <div
              className="table-responsive"
              style={{
                marginBottom: "30px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "15px",
                padding: "10px",
              }}
            >
              <table
                className="students-table"
                style={{ width: "auto", color: "white" }}
              >
                <thead>
                  <tr
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    <th style={{ padding: "12px" }}>Questions</th>
                    <th style={{ padding: "12px" }}>Time</th>
                    <th style={{ padding: "12px" }}>Expire Date</th>
                    <th style={{ padding: "12px" }}>Price</th>
                    <th style={{ padding: "12px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "12px" }}>
                      {quizData.questions_count || questions.length}{" "}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {quizData.time_limit_minutes} Mins
                    </td>
                    <td style={{ padding: "12px" }}>
                      {new Date(quizData.expires_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px" }}>Rs. {quizData.price}</td>
                    <td style={{ padding: "12px" }}>
                      {isApproved ? (
                        <span style={{ color: "#4ade80", fontWeight: "bold" }}>
                          ● UNLOCKED
                        </span>
                      ) : (
                        <span style={{ color: "#f87171", fontWeight: "bold" }}>
                          ● LOCKED
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: "center" }}>
              {isApproved ? (
                /*  <button className="register-btn" onClick={() => setShowQuestions(true)} style={{ maxWidth: "300px" }}>
                  🚀 Start Quiz Now
                </button> */
                <button
                  className="view-btn"
                  onClick={() => navigate(`/questions/${id}`)} // quizData.id වෙනුවට useParams එකෙන් එන id එක දාන්න
                >
                  🚀 Start Quiz Now
                </button>
              ) : (
                <div
                  className="locked-section"
                  style={{
                    padding: "20px",
                    background: "rgba(241, 14, 14, 0.2)",
                    borderRadius: "15px",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                    🔒
                  </div>
                  <h3>Access Restricted</h3>
                  <p>
                    Please make the payment and obtain Admin approval to start
                    this quiz.
                  </p>
                  <button
                    className="register-btn"
                    onClick={handleEnrollRequest}
                  >
                    Pay Now & Unlock
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Question View - Glassmorphism Style */
          <div className="quiz-card-inner" style={{ textAlign: "left" }}>
            <div
              style={{ marginBottom: "20px", fontSize: "0.9rem", opacity: 0.8 }}
            >
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                padding: "25px",
                borderRadius: "15px",
                border: "1px solid rgba(255,255,255,0.1)",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ marginBottom: "20px", lineHeight: "1.4" }}>
                {questions[currentQuestionIndex].question_text}
              </h3>

              <div style={{ display: "grid", gap: "10px" }}>
                {["a", "b", "c", "d"].map((opt) => (
                  <div
                    key={opt}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      padding: "12px 15px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <strong style={{ color: "#facc15", marginRight: "10px" }}>
                      {opt.toUpperCase()}
                    </strong>
                    {questions[currentQuestionIndex][`option_${opt}`]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!showQuestions && (
          <button
            className="mini-navbar button"
            onClick={() => navigate(-1)}
            style={{
              marginTop: "30px",
              width: "auto",
              padding: "8px 25px",
              color: "white",
            }}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewQuiz;
