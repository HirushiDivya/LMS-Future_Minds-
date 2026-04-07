import React, { useState, useEffect } from "react";
import API from "../../API"; // පියවර දෙකක් පිටතට (Quiz -> student -> src)

import axios from "axios";
import { useNavigate } from "react-router-dom";

//import "../StudentRegister.css";
import "./Quiz.css";
//C:\Users\hirus\OneDrive\Desktop\FS Intern\Project\LMS\frontend\src\Courses\Course.css

const AllQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("title"); // Default filter type
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = "http://localhost:5000";
  /*
 const fetchQuizzes = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/admin/all-quizzes");
    console.log("Frontend received quizzes:", res.data); // Inspect -> Console 
    setQuizzes(res.data);
  } catch (err) {
    console.error("Error fetching quizzes", err);
  }
  };*/
  const fetchQuizzes = async () => {
    try {
      let url = "/admin/all-quizzes";

      //ask data from backend
      const res = await API.get(url);
      const baseQuiz = res.data
        ? Array.isArray(res.data)
          ? res.data
          : [res.data]
        : [];

      const quizWithFullDetails = await Promise.all(
        baseQuiz.map(async (quiz) => {
          try {
            // Student count
            const countRes = await API.get(
              `/admin/enrollment-count/${quiz.id}`,
            );

            // random rating 2-5
            const randomRating = (Math.random() * (5 - 2) + 2).toFixed(1);

            return {
              ...quiz,
              students: countRes.data.total_enrolled,
              rating: randomRating,
            };
          } catch (err) {
            // Individual quiz error - default
            return {
              ...quiz,
              students: 0,
              rating: (Math.random() * (5 - 2) + 2).toFixed(1),
            };
          }
        }),
      );

      setQuizzes(quizWithFullDetails);
    } catch (err) {
      // if whole fetch process become error
      console.error("Error fetching courses", err);
      setQuizzes([]);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Filter logic based on selection
  const filteredQuizzes = quizzes.filter((q) => {
    const term = (searchTerm || "").toLowerCase();
    if (filterType === "title")
      return q.title?.toLowerCase().includes(term) || false;
    if (filterType === "id") return q.id.toString().includes(term) || false;
    if (filterType === "questions")
      return (q.questions_count || 0).toString().includes(term) || false;
    return q.title.toLowerCase().includes(term) || false;
  });

  const handleViewQuiz = (quizId) => {
  console.log("Navigating to Quiz ID:", quizId); // මේක දාලා බලන්න undefined ද කියලා
  if (quizId) {
    navigate(`/s-viewquizz/${quizId}`);
  } else {
    console.error("Quiz ID is undefined!");
  }
};
 
  return (
    <div className="quiz-page-container">
<h1 className="about-title" style={{paddingTop : "0px", marginTop :"-15px", paddingBottom: "20px"}}>
            Explore <span className="highlight">All </span>Quizes
          </h1>
      {/* Enhanced Search & Filter Section */}

      <div className="quizpagesearch-container">
        {/* Animated Search Box */}

        <div className="search-box">
          <span>🔍</span>
          <input 
            type="text"
            placeholder={`Search by ${filterType}...`}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Dropdown with Icon */}

        <div className="search-boxx">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
            }}
          >
            <option value="title">By Title</option>
            <option value="id">By Quiz ID</option>
            <option value="questions">By Questions Count</option>
          </select>
        </div>
      </div>

      {/* Card Grid System */}
      <div className="course-grid">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => (
            <div className="quiz-card" key={quiz.id}>
              <img
                src={
                  quiz.Quiz_IMG
                    ? quiz.Quiz_IMG.startsWith("http")
                      ? quiz.Quiz_IMG // Web link එකක් නම් කෙලින්ම පෙන්වන්න
                      : `${BASE_URL}/uploads/${quiz.Quiz_IMG}` // Local upload එකක් නම් path එක හදන්න
                    : "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={quiz.title}
                className="quiz-card-img"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=Error+Loading";
                }}
              />

              <div className="course-content">
                <div className="course-meta">
                  <span>⭐ {(Math.random() * (5 - 2) + 2).toFixed(1)}</span>
                  <span>👥 {quiz.students}k Students</span>
                </div>

                <h3>{quiz.title}</h3>

                <div className="quiz-footer">
                  <span className="price">LKR {quiz.price}</span>
                  <button
                    className="buy-btn"
                    onClick={() => handleViewQuiz(quiz.id)}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="loading-text"
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              color: "#facc15",
            }}
          >
            No results found for "{searchTerm}"
          </div>
        )}
      </div>

      <div style={{ marginTop: "50px" }}>
        <button className="floating-back-btn" onClick={() => navigate("/a-dashbord")}>
          ← BACK TO DASHBOARD
        </button>
      </div>
    </div>
  );
};

export default AllQuiz;
