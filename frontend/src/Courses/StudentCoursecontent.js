import React, { useState, useEffect } from "react";
import API from "../API";
import { useParams, useNavigate } from "react-router-dom";
import "./Studentcoursecontent.css";

export default function CourseContent() {
  const { course_code } = useParams();
  const navigate = useNavigate();

  const [contents, setContents] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [currentUserID, setCurrentUserID] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("userID");
    setCurrentUserID(id);

    if (course_code && id) {
      fetchCourseDetails(id);
      fetchContent();
    }
  }, [course_code]);

  const fetchCourseDetails = (userId) => {
    API.get(`/courses/${course_code}`)
      .then((res) => {
        setCourseData(res.data);
        checkEnrollmentStatus(userId, res.data.id);
      })
      .catch((err) => console.error("Error fetching course details:", err));
  };

  const checkEnrollmentStatus = (userId, courseId) => {
    API.get(`/enroll/my-dashboard/${userId}`)
      .then((res) => {
        const currentEnroll = res.data.find(
          (e) => e.course_code === course_code
        );

        if (currentEnroll) {
          const status = currentEnroll.payment_status.toLowerCase();
          setEnrollmentStatus(status);
        } else {
          setEnrollmentStatus(null);
        }
      })
      .catch(() => setEnrollmentStatus(null));
  };

  const fetchContent = () => {
    setLoading(true);
    API.get(`/content/course/${course_code}`)
      .then((res) => {
        setContents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setContents([]);
        setLoading(false);
      });
  };

  const handleEnrollRequest = () => {
    if (!currentUserID || !courseData) return;

    if (enrollmentStatus === "approved") {
      alert("ඔබ දැනටමත් මෙම පාඨමාලාවට ඇතුළත් වී ඇත!");
      return;
    }

    if (enrollmentStatus === "pending") {
      alert("ඔබේ ගෙවීම් තොරතුරු දැනටමත් පරීක්ෂා කරමින් පවතී. කරුණාකර රැඳී සිටින්න.");
      return;
    }

    const requestData = {
      student_id: currentUserID,
      course_id: courseData.id,
    };

    API.post("/enroll/enroll-request", requestData)
      .then((res) => {
        navigate(`/payment`, {
          state: {
            courseId: courseData.id,
            courseName: courseData.title || courseData.course_name,
            price: courseData.price,
            enrollId: res.data.enrollmentId,
          },
        });
      })
      .catch(() => {
        navigate(`/payment`, {
          state: {
            courseId: courseData.id,
            courseName: courseData.title || courseData.course_name,
            price: courseData.price,
          },
        });
      });
  };

  return (
    <div className="content-page-container">
      {/* 1. Header Section */}
      <div className="content-header">
        <h2 style={{ textAlign: 'center', fontSize: '2rem', color: 'var(--accent-color)' }}>
          {courseData
            ? `${courseData.title || courseData.course_name} - ${course_code}`
            : course_code}
        </h2>
      </div>

      <hr className="divider" />

      {/* 2. Main Course Content Grid */}
      <div className="tab-main-wrapper">
        <div className="tab-section">
          <h3 style={{ marginBottom: '20px' }}>Course Materials</h3>
          {loading ? (
            <p className="loading-text">Loading lessons...</p>
          ) : contents.length === 0 ? (
            <div className="empty-state-card">No content uploaded yet for this course.</div>
          ) : (
            <div className="content-grid">
              {contents.map((item) => {
                const isLocked = enrollmentStatus !== "approved";
                return (
                  <div
                    key={item.id}
                    className={`content-card ${isLocked ? "locked-card" : "unlocked-card"}`}
                  >
                    <div className="content-type-badge">{item.content_type}</div>
                    <h3>
                      {item.title} {isLocked ? "🔒" : "✅"}
                    </h3>
                    {isLocked ? (
                      <button className="view-btn-locked" style={{ opacity: 0.6 }} disabled>
                        Unlock to View
                      </button>
                    ) : (
                      <button
                        className="view-btn-active"
                        onClick={() => navigate(`/view-content/${item.id}`)}
                      >
                        View Resource
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Enrollment Bar (Only shown if not approved) */}
      {!loading && enrollmentStatus !== "approved" && (
        <div className="enrollment-footer-dark">
          <div className="enrollment-status-info">
            {enrollmentStatus === "pending" ? (
              <p style={{ color: "#ffcc00" }}>
                Status: <strong>Payment Pending Verification ⏳</strong>
              </p>
            ) : (
              <p>Get full access to all course materials and assignments.</p>
            )}
          </div>
          <button
            className="enroll-request-btn-primary"
            onClick={handleEnrollRequest}
          >
            {enrollmentStatus === "pending"
              ? "Update Payment Info"
              : "Enroll Now to Unlock"}
          </button>
        </div>
      )}
    </div>
  );
}