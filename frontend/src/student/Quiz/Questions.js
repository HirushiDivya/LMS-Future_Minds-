import React, { useState, useEffect, useCallback } from "react";
import API from "../../API";
import { useParams, useNavigate } from "react-router-dom";
import "../StudentRegister.css";

const Questions = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // --- Timer State ---
  const [timeLeft, setTimeLeft] = useState(null); 

  // Finish function (Auto-submit වලටත් පහසු වෙන්න useCallback භාවිතා කර ඇත)
  const handleFinish = useCallback(async (finalAnswers = selectedAnswers) => {
    // දැනටමත් result පෙන්වනවා නම් නැවත submit කිරීම නවත්වයි
    if (showResult) return;

    const studentId = localStorage.getItem("userID");
    const formattedAnswers = Object.entries(finalAnswers).map(([index, selected]) => ({
      questionId: questions[index].id,
      selected: selected.toUpperCase()
    }));

    try {
      const res = await API.post('/quiz/submit-quiz', {
        studentId,
        quizId: id,
        answers: formattedAnswers
      });
      setScore(res.data.score);
      setShowResult(true);
    } catch (err) {
      console.error("Submission error:", err);
      setShowResult(true); // Error එකක් ආවත් ලකුණු බැලීමට Result screen එකට යවයි
    }
  }, [id, questions, selectedAnswers, showResult]);

  useEffect(() => {
    if (id) fetchQuizData();
  }, [id]);

  // --- Timer Logic ---
  useEffect(() => {
    if (timeLeft === null || showResult) return;

    if (timeLeft <= 0) {
      handleFinish(); // වෙලාව ඉවර වුණාම auto-submit වේ
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, handleFinish, showResult]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const studentId = localStorage.getItem("userID");
      
      // 1. Quiz එකේ විස්තර (Title, Duration) ලබා ගැනීම
      const detailsRes = await API.get(`/quiz/quiz/${id}`);
      setQuizData(detailsRes.data);

      // Backend එකේ field එක time_limit_minutes නිසා එය ලබා ගනී
      if (detailsRes.data.time_limit_minutes) {
        setTimeLeft(detailsRes.data.time_limit_minutes * 60);
      }

      // 2. ප්‍රශ්න ලබා ගැනීම
      if (studentId) {
        try {
          const questionsRes = await API.get(`/quiz/get-questions/${id}?studentId=${studentId}`);
          setQuestions(questionsRes.data.questions || []);
          setIsApproved(true);
        } catch (err) {
          if (err.response && err.response.status === 403) setIsApproved(false);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching quiz data:", err);
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOptionSelect = (option) => {
    // පිළිතුරක් තේරූ පසු හෝ වෙලාව ඉවර වූ පසු පිළිතුරු වෙනස් කළ නොහැක
    if (selectedAnswers[currentQuestionIndex] || timeLeft <= 0) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: option,
    });
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) return <div className="register-page"><h2>Loading...</h2></div>;
  if (!quizData) return <div className="register-page"><h2>Quiz Not Found</h2></div>;

  // --- Result View ---
  if (showResult) {
    return (
      <div className="register-page">
        <div className="register-card profile-card-widequiz" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "80px" }}>🏆</div>
          <h2>Quiz Completed!</h2>
          <h1 style={{ fontSize: "3.5rem", margin: "20px 0" }}>{score} / {questions.length}</h1>
          <p>ඔබ සාර්ථකව ප්‍රශ්නාවලිය නිම කරන ලදී.</p>
          <button onClick={() => navigate(-1)} className="register-btn">Back to Home</button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const userSelected = selectedAnswers[currentQuestionIndex];
  const correctOptionChar = currentQuestion?.correct_option?.toLowerCase() || "";
  const isCorrect = userSelected === correctOptionChar;
  const explanationText = currentQuestion?.explanations?.[correctOptionChar];

  return (
    <div className="register-page">
      <div className="register-card profile-card-widequiz">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h2 style={{ margin: 0, fontSize: "1.4rem" }}>{quizData.title}</h2>
          
          {/* --- Timer UI --- */}
          {timeLeft !== null && (
            <div style={{ 
              background: timeLeft < 60 ? "#ef4444" : "#1e293b", 
              color: "white", padding: "8px 15px", borderRadius: "10px", fontWeight: "bold",
              fontSize: "1.1rem", border: "1px solid rgba(255,255,255,0.2)"
            }}>
              {timeLeft > 0 ? `⏱️ ${formatTime(timeLeft)}` : "Time Over!"}
            </div>
          )}

          <button onClick={() => navigate(-1)} className="mini-navbar button" style={{ background: "#ef4444", width: "auto", padding: "5px 15px" }}>✕ Close</button>
        </div>

        <hr style={{ opacity: "0.2", marginBottom: "20px" }} />

        {!isApproved ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "50px" }}>🔒</div>
            <h3>Access Denied</h3>
            <p>මෙම ප්‍රශ්නාවලිය නැරඹීමට කරුණාකර අනුමැතිය ලබාගන්න.</p>
          </div>
        ) : (
          <div className="quiz-content">
            {questions.length > 0 ? (
              <>
                <div style={{ marginBottom: "15px", fontWeight: "bold", opacity: 0.8 }}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>

                <div className="form-group" style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "15px" }}>
                  <h3 style={{ marginBottom: "25px", lineHeight: "1.5" }}>{currentQuestion?.question_text}</h3>

                  <div className="options-container" style={{ display: "grid", gap: "12px" }}>
                    {['a', 'b', 'c', 'd'].map((opt) => {
                      let bgColor = "rgba(255,255,255,0.1)";
                      if (userSelected) {
                        if (opt === correctOptionChar) bgColor = "#16a34a"; 
                        else if (opt === userSelected) bgColor = "#ef4444";
                      }

                      return (
                        <div key={opt} onClick={() => handleOptionSelect(opt)}
                          style={{ 
                            background: bgColor, padding: "15px", borderRadius: "10px", 
                            textAlign: "left", cursor: (userSelected || timeLeft <= 0) ? "default" : "pointer",
                            border: "1px solid rgba(255,255,255,0.2)", transition: "0.3s",
                            display: "flex", gap: "10px"
                          }}
                        >
                          <strong>{opt.toUpperCase()}.</strong> 
                          {currentQuestion?.options?.[opt]}
                        </div>
                      );
                    })}
                  </div>

                  {userSelected && (
                    <div style={{ 
                      marginTop: "20px", padding: "15px", borderRadius: "10px",
                      background: isCorrect ? "rgba(22, 163, 74, 0.2)" : "rgba(239, 68, 68, 0.2)",
                      borderLeft: `5px solid ${isCorrect ? "#16a34a" : "#ef4444"}`
                    }}>
                      <strong style={{ color: isCorrect ? "#4ade80" : "#f87171" }}>
                        {isCorrect ? "✅ නිවැරදියි!" : "❌ වැරදියි!"}
                      </strong>
                      <p style={{ marginTop: "10px", fontSize: "0.95rem", lineHeight: "1.4", color: "white" }}>
                        {explanationText ? explanationText : "මෙම ප්‍රශ්නය සඳහා විවරණයක් ඇතුළත් කර නැත."}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mini-navbar" style={{ marginTop: "30px", background: "none" }}>
                  <button onClick={goToBack} disabled={currentQuestionIndex === 0} style={{ opacity: currentQuestionIndex === 0 ? 0.3 : 1 }}>← Back</button>
                  {currentQuestionIndex === questions.length - 1 ? (
                    <button onClick={() => handleFinish()} disabled={!userSelected} style={{ background: "#16a34a", fontWeight: "bold" }}>Finish Quiz</button>
                  ) : (
                    <button onClick={goToNext} disabled={!userSelected} style={{ background: "#2563eb", opacity: !userSelected ? 0.5 : 1 }}>Next Question →</button>
                  )}
                </div>
              </>
            ) : (
              <p>No questions available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions;