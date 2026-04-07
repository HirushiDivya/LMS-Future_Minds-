import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import API from "../API";
//student profile - progress,enrolmnts,paymnts,personl details

export default function StudentProfile() {
  const { name: urlName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ enrolledCourses: [], quizActivity: [] });
  const [activeTab, setActiveTab] = useState("profile");
  const [overallProgress, setOverallProgress] = useState(0); 
  const [courseOverallProgress, setCourseOverallProgress] = useState(0); 

  const [studentData, setStudentData] = useState({
    full_name:
      location.state?.name || urlName || localStorage.getItem("userName"),
    email: "",
    mobile: "",
    loading: true,
  });

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const res = await API.get(`/students/${studentData.full_name}`);
        if (res.data && res.data.length > 0) {
          const user = res.data[0];
          setStudentData((prev) => ({
            ...prev,
            email: user.email,
            mobile: user.mobile,
            loading: false,
          }));
        }
      } catch (err) {
        console.error("Error fetching student details:", err);
        setStudentData((prev) => ({ ...prev, loading: false }));
      }
    };
    if (studentData.full_name) fetchStudentDetails();
  }, [studentData.full_name]);

  
  useEffect(() => {
    const fetchDashboardData = async () => {
      const sID = localStorage.getItem("userID");
      if (!sID) return;

      try {
        const res = await API.get(`/students/student-stats/${sID}`);
        setStats(res.data);

        // progress percentage route  call 
        const progRes = await API.get(`/quiz/total-progress/${sID}`);
        setOverallProgress(progRes.data.overall_progress);

        const courseRes = await API.get(`/students/course-progress/${sID}`);
        setCourseOverallProgress(courseRes.data.course_completion_percentage);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    if (
      activeTab === "courses" ||
      activeTab === "requests" ||
      activeTab === "progress"
    ) {
      fetchDashboardData();
    }
  }, [activeTab]);
  

  if (studentData.loading)
    return (
      <div className="register-page">
        <p>Loading details...</p>
      </div>
    );

  return (
    <div className="register-page">
      <div className="register-card profile-card-wide">
        <div className="mini-navbar">
          <button
            className={activeTab === "profile" ? "active-tab" : ""}
            onClick={() => setActiveTab("profile")}
          >
            User Profile
          </button>
          <button
            className={activeTab === "courses" ? "active-tab" : ""}
            onClick={() => setActiveTab("courses")}
          >
            Learning Progress
          </button>

          <button
            className={activeTab === "progress" ? "active-tab" : ""}
            onClick={() => setActiveTab("progress")}
          >
            Overall Percentage
          </button>

          <button
            className={activeTab === "requests" ? "active-tab" : ""}
            onClick={() => setActiveTab("requests")}
          >
            Pending Requests
          </button>
        </div>

        <div className="tab-content">
          {/* --- Profile Tab --- */}
          {activeTab === "profile" && (
            <div className="tab-pane">
              <h2>Student Profile 🎓</h2>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={studentData.full_name} readOnly />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="text"
                  value={studentData.email || "Not available"}
                  readOnly
                />
              </div>
            </div>
          )}

          {/* --- Enrolled Courses & Quizzes Tab --- */}
          {activeTab === "courses" && (
            <div className="tab-pane" style={{ padding: "10px" }}>
              <h2 style={{ color: "#fff", marginBottom: "20px" }}>
                My Learning Journey 📚
              </h2>

              {/* --- Courses Section --- */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h3 style={{ color: "#fff", fontSize: "18px" }}>
                  Approved Courses
                </h3>
                <span style={{ fontSize: "12px", color: "#eee", opacity: 0.8 }}>
                  Swipe ↔
                </span>
              </div>

              <div
                className="scroll-container"
                style={{
                  display: "flex",
                  overflowX: "auto",
                  gap: "15px",
                  paddingBottom: "15px",
                  msOverflowStyle: "none" /* IE/Edge */,
                  scrollbarWidth: "none" /* Firefox */,
                }}
              >
                {stats.enrolledCourses.filter(
                  (e) => e.payment_status === "Approved",
                ).length > 0 ? (
                  stats.enrolledCourses
                    .filter((e) => e.payment_status === "Approved")
                    .map((course, index) => (
                      <div
                        key={index}
                        style={{
                          minWidth: "220px",
                          background: "rgba(255, 255, 255, 0.2)",
                          backdropFilter: "blur(10px)",
                          borderRadius: "15px",
                          padding: "15px",
                          color: "#fff",
                          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                          border: "1px solid rgba(255,255,255,0.3)",
                        }}
                      >
                        <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                          🎓
                        </div>
                        <h4
                          style={{
                            margin: "0 0 10px 0",
                            fontSize: "16px",
                            height: "40px",
                            overflow: "hidden",
                          }}
                        >
                          {course.course_name}
                        </h4>

                        <div
                          style={{
                            fontSize: "12px",
                            marginBottom: "5px",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Progress</span>
                          <span>{course.course_progress_percentage}%</span>
                        </div>

                        <div
                          style={{
                            background: "rgba(255,255,255,0.3)",
                            borderRadius: "10px",
                            height: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${course.course_progress_percentage}%`,
                              background: "#4caf50",
                              height: "100%",
                              transition: "width 0.5s ease",
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p style={{ color: "#eee" }}>No active courses.</p>
                )}
              </div>

              <hr
                style={{
                  border: "0",
                  height: "1px",
                  background: "rgba(255,255,255,0.2)",
                  margin: "20px 0",
                }}
              />

              {/* --- Quizzes Section --- */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h3 style={{ color: "#fff", fontSize: "18px" }}>
                  Quiz Performance
                </h3>
                <span style={{ fontSize: "12px", color: "#eee", opacity: 0.8 }}>
                  Swipe ↔
                </span>
              </div>

              <div
                className="scroll-container"
                style={{
                  display: "flex",
                  overflowX: "auto",
                  gap: "15px",
                  paddingBottom: "15px",
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              >
                {stats.quizActivity && stats.quizActivity.length > 0 ? (
                  stats.quizActivity.map((quiz, idx) => (
                    <div
                      key={idx}
                      style={{
                        minWidth: "180px",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "15px",
                        padding: "15px",
                        color: "#fff",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "10px",
                          width: "fit-content",
                          marginBottom: "10px",
                        }}
                      >
                        QUIZ
                      </div>
                      <h4 style={{ margin: "0 0 10px 0", fontSize: "15px" }}>
                        {quiz.quiz_name}
                      </h4>

                      <div style={{ fontSize: "12px", opacity: 0.9 }}>
                        <p style={{ margin: "2px 0" }}>
                          Attempts: {quiz.attempt_count}
                        </p>
                        {quiz.score !== null ? (
                          <div
                            style={{
                              marginTop: "10px",
                              background: "rgba(0,0,0,0.2)",
                              padding: "8px",
                              borderRadius: "10px",
                              textAlign: "center",
                            }}
                          >
                            <strong style={{ fontSize: "16px" }}>
                              {quiz.score} / {quiz.total_questions}
                            </strong>
                            <div style={{ fontSize: "10px", marginTop: "3px" }}>
                              Last Attempt
                            </div>
                          </div>
                        ) : (
                          <p
                            style={{
                              marginTop: "10px",
                              fontStyle: "italic",
                              fontSize: "11px",
                            }}
                          >
                            Not attempted yet
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#eee" }}>No quiz activity found.</p>
                )}
              </div>
            </div>
          )}          

          {/* --- Overall Progress Tab Content --- */}
          {activeTab === "progress" && (
            <div
              className="tab-pane"
              style={{ textAlign: "center", padding: "20px" }}
            >
              <h2 style={{ color: "#fff", marginBottom: "30px" }}>
                Your Learning Milestones 🏆
              </h2>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  flexWrap: "wrap",
                  gap: "20px",
                }}
              >
                {/* --- Course Completion Section --- */}
                <div style={{ minWidth: "160px" }}>
                  <h4 style={{ color: "#aaa", fontSize: "14px" }}>
                    COURSE COMPLETION
                  </h4>
                  <div
                    style={{
                      position: "relative",
                      width: "120px",
                      height: "120px",
                      margin: "15px auto",
                    }}
                  >
                    <svg width="120" height="120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#2196f3" 
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={314}
                        strokeDashoffset={
                          314 - (314 * courseOverallProgress) / 100
                        }
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    >
                      {courseOverallProgress}%
                    </div>
                  </div>
                </div>

                {/* --- Quiz Completion Section --- */}
                <div style={{ minWidth: "160px" }}>
                  <h4 style={{ color: "#aaa", fontSize: "14px" }}>
                    QUIZ PERFORMANCE
                  </h4>
                  <div
                    style={{
                      position: "relative",
                      width: "120px",
                      height: "120px",
                      margin: "15px auto",
                    }}
                  >
                    <svg width="120" height="120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#4caf50" /* Green color for quizzes */
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={314}
                        strokeDashoffset={314 - (314 * overallProgress) / 100}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    >
                      {overallProgress}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivational Message */}
              <div
                style={{
                  marginTop: "30px",
                  padding: "15px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p style={{ color: "#eee", margin: 0 }}>
                  {courseOverallProgress === 100
                    ? "You've mastered all the course content! Ready for the finals? 🎓"
                    : "Keep exploring the lessons to reach 100% course completion! 🚀"}
                </p>
              </div>
            </div>
          )}
          {/* --- Pending Requests --- */}
          {activeTab === "requests" && (
            <div className="tab-pane">
              <h2>Pending Requests ⏳</h2>
              {stats.enrolledCourses
                .filter((e) => e.payment_status !== "Approved")
                .map((req, index) => (
                  <div
                    key={index}
                    className={`item-card ${req.payment_status.toLowerCase()}`}
                  >
                    <h4>{req.course_name}</h4>
                    <p>
                      Status: <strong>{req.payment_status}</strong>
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>

        <button className="register-btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    </div>
  );
}
