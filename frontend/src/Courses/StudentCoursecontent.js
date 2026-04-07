import React, { useState, useEffect } from "react";
import API from "../API";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./CourseContent.css";

export default function CourseContent() {
  const { course_code } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Student");
  const [searchTerm, setSearchTerm] = useState(""); // මේක අලුතින් එකතු කරන්න

  const [contents, setContents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [enrolledQuizzes, setEnrolledQuizzes] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [currentUserID, setCurrentUserID] = useState(null);
  const [studentStatus, setStudentStatus] = useState("Active"); // Default active ලෙස තබා ගන්න

  // Sidebar states
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("all"); // අලුතින් එකතු කළා

  useEffect(() => {
    const id = localStorage.getItem("userID");
    const storedName = localStorage.getItem("userName");
    setCurrentUserID(id);

    if (course_code && id) {
      fetchCourseDetails(id);
      fetchContent();
      fetchQuizzes();
      fetchEnrolledQuizzes(id);
    }
    if (storedName) {
      setUserName(storedName);
    }
  }, [course_code]);

  const fetchQuizzes = () => {
    API.get(`/admin/quizzes-by-course/${course_code}`)
      .then((res) => setQuizzes(res.data))
      .catch((err) => console.error("Quizzes fetch error:", err));
  };

  const fetchEnrolledQuizzes = (userId) => {
    API.get(`/admin/student/quiz-payments/${userId}`)
      .then((res) => setEnrolledQuizzes(res.data))
      .catch(() => setEnrolledQuizzes([]));
  };

  const fetchCourseDetails = (userId) => {
    API.get(`/courses/${course_code}`)
      .then((res) => {
        setCourseData(res.data);
        checkEnrollmentStatus(userId, res.data.id);
      })
      .catch((err) => console.error("Error fetching course details:", err));
  };
  /*
  const checkEnrollmentStatus = (userId, courseId) => {
    API.get(`/enroll/my-dashboard/${userId}`)
      .then((res) => {
        const currentEnroll = res.data.find(
          (e) => e.course_code === course_code,
        );
        setEnrollmentStatus(
          currentEnroll ? currentEnroll.payment_status.toLowerCase() : null,
        );
      })
      .catch(() => setEnrollmentStatus(null));
  };
*/
  const fetchContent = () => {
    setLoading(true);
    API.get(`/content/course/${course_code}`)
      .then((res) => {
        setContents(res.data);
        setLoading(false);
      })
      .catch(() => {
        setContents([]);
        setLoading(false);
      });
  };
  /*
  const handleEnrollRequest = () => {
    if (!currentUserID || !courseData) return;
    if (enrollmentStatus === "pending") {
      Swal.fire({
        title: "Payment Pending!",
        text: "Please wait for admin approval.",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }
    navigate(`/payment`, {
      state: {
        courseId: courseData.id,
        courseName: courseData.title || courseData.course_name,
        price: courseData.price,
        type: "COURSE",
      },
    });
  };
*/
  const handleEnrollRequest = () => {
    if (!currentUserID || !courseData) return;

    // ශිෂ්‍යයා Deactive ද නැද්ද කියා මුලින්ම බලන්න
    if (studentStatus === "Deactive") {
      Swal.fire({
        title: "Account Suspended!",
        text: "Your account is deactivated. You cannot enroll in new courses. Please contact Admin.",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
      return; // මෙතනින් function එක නතර වෙනවා, payment page එකට navigate වෙන්නේ නැහැ
    }

    if (enrollmentStatus === "pending") {
      Swal.fire({
        title: "Payment Pending!",
        text: "Please wait for admin approval.",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    navigate(`/payment`, {
      state: {
        courseId: courseData.id,
        courseName: courseData.title || courseData.course_name,
        price: courseData.price,
        type: "COURSE",
      },
    });
  };
  /*
  const handleQuizPayment = (quiz) => {
    const paymentRecord = enrolledQuizzes.find(
      (p) => p.quiz_name === quiz.title,
    );
    if (paymentRecord?.status.toLowerCase() === "pending") {
      Swal.fire({
        title: "Payment Pending!",
        text: "Wait for verification.",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }
    navigate(`/qpayment`, {
      state: {
        title: quiz.title,
        price: quiz.price,
        id: quiz.id,
        type: "QUIZ",
      },
    });
  };
*/

  const handleQuizPayment = (quiz) => {
    // ශිෂ්‍යයා Deactive ද නැද්ද කියා මුලින්ම බලන්න
    if (studentStatus === "Deactive") {
      Swal.fire({
        title: "Action Blocked!",
        text: "You cannot purchase quizzes while your account is deactivated.",
        icon: "warning",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    const paymentRecord = enrolledQuizzes.find(
      (p) => p.quiz_name === quiz.title,
    );

    if (paymentRecord?.status.toLowerCase() === "pending") {
      Swal.fire({
        title: "Payment Pending!",
        text: "Wait for verification.",
        icon: "info",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    navigate(`/qpayment`, {
      state: {
        title: quiz.title,
        price: quiz.price,
        id: quiz.id,
        type: "QUIZ",
      },
    });
  };
  // Sidebar එකේ click කරද්දී Scroll වෙන්න මේ function එක පාවිච්චි කරන්න
  const handleSidebarClick = (id) => {
    setSelectedItemId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const checkEnrollmentStatus = (userId, courseId) => {
    API.get(`/enroll/my-dashboard/${userId}`)
      .then((res) => {
        console.log("Response data:", res.data); // මෙතනින් student_account_status එක එනවාදැයි පරීක්ෂා කරන්න

        if (res.data.length > 0) {
          // DB එකේ "Active" / "Deactive" කියලා තිබුණොත් ඒ විදිහටම set වෙනවා
          setStudentStatus(res.data[0].student_account_status);
        }

        const currentEnroll = res.data.find(
          (e) => e.course_code === course_code,
        );
        setEnrollmentStatus(
          currentEnroll ? currentEnroll.payment_status.toLowerCase() : null,
        );
      })
      .catch(() => setEnrollmentStatus(null));
  };

  const markAsCompleted = (contentId) => {
    const studentId = localStorage.getItem("userID"); // දැනට ලොග් වී සිටින ශිෂ්‍යයාගේ ID එක

    if (!studentId || !contentId) return;

    API.post("/students/mark-completed", {
      student_id: studentId,
      content_id: contentId,
    })
      .then((res) => {
        console.log("Progress updated for content:", contentId);
      })
      .catch((err) => {
        console.error("Progress update failed:", err);
      });
  };

  return (
    // layout එක මුලින්ම එන්න ඕනේ
    <div
      className={`course-page-layout ${isSidebarMinimized ? "sidebar-minimized" : ""}`}
    >
      {/* --- SIDEBAR --- */}
      <aside className="course-sidebarr">
        <div className="sidebar-toggle-container">
          <button
            className="toggle-btn"
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          >
            {isSidebarMinimized ? "➔" : "⬅"}
          </button>
        </div>

        {!isSidebarMinimized && (
          <div className="sidebar-content-wrapperr">
            <div
              className={`sidebar-header ${selectedItemId === "all" ? "active-all" : ""}`}
              onClick={() => {
                setSelectedItemId("all");
                window.scrollTo({ top: 0, behavior: "smooth" }); // මුලටම scroll වෙන්න
              }}
              style={{ cursor: "pointer" }}
            >
              <h4>Let's Start</h4>
            </div>

            <div className="sidebar-section">
              <h5>📚 Lessons</h5>
              <ul>
                {contents.map((c) => (
                  <li
                    key={c.id}
                    className={
                      selectedItemId === `content-${c.id}` ? "active-link" : ""
                    }
                    onClick={() => handleSidebarClick(`content-${c.id}`)}
                  >
                    • {c.title}
                  </li>
                ))}
              </ul>
            </div>

            <div className="sidebar-section">
              <h5>📝 Quizzes</h5>
              <ul>
                {quizzes.length > 0 ? (
                  quizzes.map((q) => (
                    <li
                      key={q.id}
                      className={
                        selectedItemId === `quiz-${q.id}` ? "active-link" : ""
                      }
                      onClick={() => handleSidebarClick(`quiz-${q.id}`)} // Scroll වෙන්න handleSidebarClick පාවිච්චි කරන්න
                      style={{ cursor: "pointer" }}
                    >
                      • {q.title}
                    </li>
                  ))
                ) : (
                  <li className="no-item-sidebar">No quizzes available</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="course-main-content">
        {studentStatus === "Deactive" && (
          <div
            style={{
              background: "#c5c4c4",
              color: "#fff",
              padding: "15px",
              borderRadius: "8px",
              textAlign: "center",
              marginBottom: "20px",
              fontWeight: "bold",
            }}
          >
            ⚠️ Your account has been suspended. Please contact the Admin for
            support.
          </div>
        )}
        <div className="content-header">
          <h4 className="Name-address">
            Welcome Back, <span>{userName}!</span>
          </h4>

          <h2 className="student-course-content-header">
            {courseData
              ? `${courseData.title || courseData.course_name}`
              : course_code}
          </h2>
          {/* --- Search Bar Start --- */}
          <div className="search-bar-wrapper">
            <span className="search-bar-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search for materials, lessons, or quizzes"
              className="simple-search-input"
              onChange={(e) => setSearchTerm(e.target.value)} // Search filter එකට
            />
          </div>
          {/* --- Search Bar End --- */}
        </div>
        <hr className="divider" />

        {/* Materials Display (Filtered) */}
        {(selectedItemId === "all" ||
          selectedItemId.startsWith("content-")) && (
          <div className="tab-section">
            <h3 className="coursecontent-sub-header">Continue Your Learning</h3>
            <div className="content-grid">
              {contents
                .filter((item) => {
                  const matchesSearch = item.title
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
                  const matchesSidebar =
                    selectedItemId === "all" ||
                    selectedItemId === `content-${item.id}`;
                  return matchesSearch && matchesSidebar;
                })
                .map((item) => {
                  {
                    /*const isLocked = enrollmentStatus !== "approved"; */
                  }
                  const isLocked =
                    enrollmentStatus !== "approved" ||
                    studentStatus === "Deactive";
                  return (
                    <div
                      key={item.id}
                      className={`course-content-card ${isLocked ? "locked-card" : "unlocked-card"}`}
                    >
                      <div className="content-type-badge">
                        {item.content_type}
                      </div>
                      {/* <h3 className="course-content-card-title">
                        {item.title} {isLocked ? "🔒" : "✅"}
                      </h3>*/}
                      {/* පරණ h3 එක වෙනුවට මේ කොටස දාන්න */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          margin: "15px 0",
                          textAlign: "center",
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
                          {item.title}
                        </h3>
                        <div
                          style={{
                            fontSize: "2rem",
                            background: "rgba(255,255,255,0.1)",
                            width: "0px",
                            height: "100px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                          }}
                        >
                          {isLocked ? "🔒" : "✅"}
                        </div>
                      </div>
                      {/*<button
                        className={
                          isLocked ? "view-btn-locked" : "view-btn-active"
                        }
                        disabled={isLocked}
                        onClick={() =>
                          !isLocked && window.open(item.external_link, "_blank")
                        }
                      >
                        {isLocked ? "Unlock to View" : "View Resource"}
                      </button> */}
                      <button
                        className={
                          isLocked ? "view-btn-locked" : "view-btn-active"
                        }
                        disabled={isLocked}
                        onClick={() => {
                          if (!isLocked) {
                            // 1. Backend එකට progress එක යවන්න
                            markAsCompleted(item.id);

                            // 2. Resource එක අලුත් tab එකක open කරන්න
                            window.open(item.external_link, "_blank");
                          }
                        }}
                      >
                        {isLocked ? "Unlock to View" : "View Resource"}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Quiz Display (Filtered) */}
        {(selectedItemId === "all" || selectedItemId.startsWith("quiz-")) && (
          <div className="tab-section" style={{ marginTop: "40px" }}>
            <h3 className="coursecontent-sub-header">Available Quizzes</h3>
            <div className="content-grid">
              {quizzes
                .filter((q) => {
                  const matchesSearch = q.title
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
                  const matchesSidebar =
                    selectedItemId === "all" ||
                    selectedItemId === `quiz-${q.id}`;
                  return matchesSearch && matchesSidebar;
                })
                .map((quiz) => {
                  const paymentRecord = enrolledQuizzes.find(
                    (p) => p.quiz_name === quiz.title,
                  );
                  {
                    /*const isApproved =
                    paymentRecord?.status.toLowerCase() === "approved";
                  const isPending =
                    paymentRecord?.status.toLowerCase() === "pending"; */
                  }
                  const isApproved =
                    paymentRecord?.status.toLowerCase() === "approved" &&
                    studentStatus === "Active";
                  const isPending =
                    paymentRecord?.status.toLowerCase() === "pending";

                  return (
                    <div
                      key={quiz.id}
                      className={`content-card ${isApproved ? "unlocked-card" : "locked-card"}`}
                    >
                      <div className="content-type-badge quiz-badge">QUIZ</div>
                      <h3>
                        {quiz.title} {isApproved ? "✅" : "🔒"}
                      </h3>
                      <p>
                        <strong>Price: Rs.{quiz.price}</strong>
                      </p>
                      {isApproved ? (
                        <button
                          className="view-btn-active"
                          onClick={() => navigate(`/s-viewquizz/${quiz.id}`)}
                        >
                          View Quiz
                        </button>
                      ) : (
                        <button
                          className="enroll-request-btn-primary"
                          style={{
                            background: isPending ? "#4b5563" : "#facc15",
                          }}
                          onClick={() => handleQuizPayment(quiz)}
                        >
                          {isPending ? "Pending ⏳" : "Buy Quiz"}
                        </button>
                      )}
                    </div>
                  );
                })}
              {quizzes.length === 0 && selectedItemId === "all" && (
                <p className="no-item-text">No quizzes available.</p>
              )}
            </div>
          </div>
        )}

        {/* Enrollment Footer */}
        {!loading && enrollmentStatus !== "approved" && (
          <div className="enrollment-footer-dark">
            <p>
              {enrollmentStatus === "pending"
                ? "Your request is pending admin approval."
                : "Get full access to all materials."}
            </p>
            {/* <button
              className="enroll-request-btn-primary"
              onClick={handleEnrollRequest}
              style={{
                background:
                  enrollmentStatus === "pending" ? "#4b5563" : "#facc15",
              }}
              disabled={enrollmentStatus === "pending"}
            >
              {enrollmentStatus === "pending"
                ? "Pending Approval ⏳"
                : "Enroll Now"}
            </button> */}
            <button
              className="enroll-request-btn-primary"
              onClick={handleEnrollRequest}
              style={{
                background:
                  enrollmentStatus === "pending" || studentStatus === "Deactive"
                    ? "#4b5563"
                    : "#facc15",
                cursor:
                  studentStatus === "Deactive" ? "not-allowed" : "pointer",
              }}
              disabled={
                enrollmentStatus === "pending" || studentStatus === "Deactive"
              }
            >
              {studentStatus === "Deactive"
                ? "Enrollment Blocked 🔒"
                : enrollmentStatus === "pending"
                  ? "Pending Approval ⏳"
                  : "Enroll Now"}
            </button>
          </div>
        )}
        <button
          className="floating-back-btn"
          style={{ marginBottom: "40px" }}
          onClick={() => navigate("/a-dashbord")}
        >
          ← BACK TO DASHBOARD
        </button>
      </main>
    </div>
  );
}
