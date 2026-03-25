import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../StudentRegister.css"; 

const AllQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("title"); // Default filter type
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

 const fetchQuizzes = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/admin/all-quizzes");
    console.log("Frontend received quizzes:", res.data); // Inspect -> Console බලන්න
    setQuizzes(res.data);
  } catch (err) {
    console.error("Error fetching quizzes", err);
  }
};

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Filter logic based on selection
  const filteredQuizzes = quizzes.filter((q) => {
    const term = searchTerm.toLowerCase();
    if (filterType === "title") return q.title.toLowerCase().includes(term);
    if (filterType === "id") return q.id.toString().includes(term);
    if (filterType === "questions") return (q.questions_count || 0).toString().includes(term);
    return q.title.toLowerCase().includes(term);
  });

  return (
    <div className="content-page-container">
      <h1 className="dashboard-title">AVAILABLE QUIZZES</h1>
      
      {/* Enhanced Search & Filter Section */}
      <div className="search-container" style={{ gap: '20px', alignItems: 'center' }}>
        
        {/* Animated Search Box */}
        <div className="search-box" style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center' }}>
          <input
            type="text"
            placeholder={`Search by ${filterType}...`}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: isSearchFocused ? '100%' : '300px', // Type කරන විට විශාල වීම
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              paddingLeft: '45px',
              fontSize: '1rem'
            }}
          />
          <span style={{ position: 'absolute', left: isSearchFocused ? '15px' : 'calc(50% - 135px)', top: '50%', transform: 'translateY(-50%)', transition: 'left 0.4s' }}>
            🔍
          </span>
        </div>

        {/* Filter Dropdown with Icon */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '5px 15px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span style={{ marginRight: '10px' }}>⚙️</span> {/* Filter Icon */}
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ 
              background: 'transparent', 
              color: 'white', 
              border: 'none', 
              outline: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <option value="title" style={{color: '#000'}}>By Title</option>
            <option value="id" style={{color: '#000'}}>By Quiz ID</option>
            <option value="questions" style={{color: '#000'}}>By Questions Count</option>
          </select>
        </div>
      </div>

      {/* Card Grid System */}
      <div className="course-grid">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => (
            <div className="course-card" key={quiz.id}>
              <h3>{quiz.title}</h3>
              <h4 style={{ padding: "12px" }}> {quiz.qdescription }</h4>
              <p style={{ padding: "12px" }}> {quiz.questions_count }</p>
              
              <div className="course-footer">
                <span className="course-price">Rs. {quiz.price}</span>
                <button
                  className="view-btn"
                  onClick={() => navigate(`/s-viewquizz/${quiz.id}`)}
                >
                  View Quiz
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="loading-text" style={{ gridColumn: '1/-1', textAlign: 'center', color: '#facc15' }}>
            No results found for "{searchTerm}"
          </div>
        )}
      </div>

      <div style={{ marginTop: '50px' }}>
        <button 
          className="enroll-request-btn-primary" 
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
          onClick={() => navigate(-1)}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AllQuiz;