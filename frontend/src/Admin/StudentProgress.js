import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ArrowLeft,
  Download,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";
import API from "../API";
import "../Admin/css/AllStudents.css";

export default function StudentProgress() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [overallCourseProgress, setOverallCourseProgress] = useState(0);
  const [overallQuizProgress, setOverallQuizProgress] = useState(0);

  const [courseProgressList, setCourseProgressList] = useState([]);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const [statsRes, courseRes, quizRes, progressRes] = await Promise.all([
          API.get(`/students/student-stats/${id}`), // stuudentstatus
          API.get(`/students/course-progress/${id}`), //course progress bar
          API.get(`/quiz/total-progress/${id}`), // circle
          API.get(`/students/student-progress/${id}`),
        ]);

        setStats(statsRes.data);
        setOverallCourseProgress(
          courseRes.data.course_completion_percentage || 0,
        );
        setOverallQuizProgress(quizRes.data.overall_progress || 0);

        // progress list  save
        setCourseProgressList(progressRes.data.data || []);

        setLoading(false);
      } catch (err) {
        console.error("API Error:", err);
        setLoading(false);
      }
    };

    fetchAllStats();
  }, [id]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const studentName =
      stats?.full_name || stats?.enrolledCourses?.[0]?.full_name || "N/A";

    // --- PDF Header ---
    doc.setFillColor(0, 21, 41);
    doc.rect(0, 0, pageWidth, 45, "F");
    doc.setTextColor(255, 204, 0);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("STUDENT PROGRESS REPORT", pageWidth / 2, 28, { align: "center" });

    // --- Student Info ---
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Student Name: ${studentName}`, 15, 55);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Student ID: ${id}`, 15, 62);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 15, 69);
    doc.text("COURSE COMPLETION", courseCircleX, circleY - 18, {
      align: "center",
    });
    doc.setTextColor(0, 102, 204);
    doc.text(
      `${Math.round(overallCourseProgress)}%`,
      courseCircleX,
      circleY + 2,
      { align: "center" },
    );

    // --- PROGRESS CIRCLES (Fix for doc.arc error) ---
    const circleY = 95;
    const courseCircleX = pageWidth / 4;
    const quizCircleX = (pageWidth / 4) * 3;

    // Background Circles
    doc.setLineWidth(1.5);
    doc.setDrawColor(220, 220, 220);
    doc.circle(courseCircleX, circleY, 12, "S");
    doc.circle(quizCircleX, circleY, 12, "S");

    // Progress Indicators presentge
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    // Course Progress Text
    doc.text("COURSE COMPLETION", courseCircleX, circleY - 18, {
      align: "center",
    });
    doc.setTextColor(0, 102, 204); // Blue color for progress text
    doc.text(
      `${Math.round(overallCourseProgress)}%`,
      courseCircleX,
      circleY + 2,
      { align: "center" },
    );

    // Quiz Performance Text
    doc.setTextColor(40, 40, 40);
    doc.text("QUIZ PERFORMANCE", quizCircleX, circleY - 18, {
      align: "center",
    });
    doc.setTextColor(76, 175, 80); // Green color for progress text
    doc.text(`${Math.round(overallQuizProgress)}%`, quizCircleX, circleY + 2, {
      align: "center",
    });

    // --- TABLES ---
    doc.setTextColor(40, 40, 40);

    // Courses Table
    autoTable(doc, {
      startY: 120,
      head: [["Course Name", "Enroll Date", "Payment", "Progress"]],
      body: stats.enrolledCourses?.map((c) => [
        c.course_name,
        new Date(c.enroll_date).toLocaleDateString(),
        c.payment_status,
        `${c.course_progress_percentage}%`,
      ]),
      headStyles: { fillColor: [0, 35, 71], textColor: [255, 204, 0] },
      styles: { fontSize: 9 },
    });

    // Quiz Table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [["Quiz Name", "Date", "Score", "Attempts"]],
      body: stats.quizActivity?.map((q) => [
        q.quiz_name,
        q.attempt_date ? new Date(q.attempt_date).toLocaleDateString() : "N/A",
        `${q.score || 0} / ${q.total_questions || 0}`,
        q.attempt_count,
      ]),
      headStyles: { fillColor: [0, 35, 71], textColor: [255, 204, 0] },
      styles: { fontSize: 9 },
    });

    // Save the PDF
    const safeFileName = studentName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    doc.save(`Progress_Report_${safeFileName}.pdf`);
  };
  if (loading)
    return <div className="loading-screen">Loading Student Data...</div>;

  return (
    <div className="admin-dashboard-wrapper">
      <main className="admin-main-content">
        {/* Header Section */}
        <div className="dashboard-header-flex">
          <h2 className="dashboard-title-text" style={{ marginTop: "30px" }}>
            Student Progress Analysis
          </h2>
          <div
            className="notification-containrer"
            style={{ flexDirection: "row", marginRight: "20px" }}
          >
            <span
              className="student-name"
              style={{ marginRight: "20px", fontWeight: "bold" }}
            >
              {/* 1st- full_name ,then array  */}
              Name:{" "}
              {stats?.full_name ||
                stats?.enrolledCourses?.[0]?.full_name ||
                "N/A"}
            </span>
            <span className="student-name">ID: {id}</span>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <BookOpen size={24} />
            </div>
            <div className="stat-info">
              <p>Enrolled Courses</p>
              <h2>{stats.enrolledCourses?.length || 0}</h2>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <ClipboardCheck size={24} />
            </div>
            <div className="stat-info">
              <p>Quizzes Attempted</p>
              <h2>{stats.quizActivity?.length || 0}</h2>
            </div>
          </div>
        </div>

        {/* Enrolled Courses Table */}
        <div className="card-panel" style={{ marginBottom: "30px" }}>
          <h3 className="card-title">Enrolled Courses</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Enroll Date</th>
                  <th>Payment Status</th>
                  <th>Overall Progress</th>
                </tr>
              </thead>{" "}
              <tbody>
                {stats.enrolledCourses?.map((course, index) => {
                  // course progress find from progress list
                  const specificProgress = courseProgressList.find(
                    (p) =>
                      p.course_id === course.course_id ||
                      p.course_title === course.course_name,
                  );

                  const progressValue = specificProgress
                    ? specificProgress.progress_percentage
                    : 0;

                  return (
                    <tr key={index} className="table-row-hover">
                      <td>
                        <span className="student-name">
                          {course.course_name}
                        </span>
                      </td>
                      <td>
                        {new Date(course.enroll_date).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            course.payment_status === "Approved" ||
                            course.payment_status === "Paid"
                              ? "status-approved"
                              : "status-pending"
                          }`}
                        >
                          {course.payment_status}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            width: "100%",
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: "10px",
                            height: "8px",
                            marginBottom: "5px",
                          }}
                        >
                          <div
                            style={{
                              width: `${progressValue}%`,
                              background: "#ffcc00",
                              height: "100%",
                              borderRadius: "10px",
                              transition: "width 0.5s ease-in-out",
                              boxShadow: "0 0 10px rgba(255, 204, 0, 0.5)",
                            }}
                          ></div>
                        </div>
                        <small>{progressValue}% Completed</small>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quiz Activity Table */}
        <div className="card-panel">
          <h3 className="card-title">Quiz Performance</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Last Attempt</th>
                  <th>Best Score</th>
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {stats.quizActivity?.map((quiz, index) => (
                  <tr key={index} className="table-row-hover">
                    <td>
                      <span className="student-name">{quiz.quiz_name}</span>
                    </td>
                    <td>
                      {quiz.attempt_date
                        ? new Date(quiz.attempt_date).toLocaleDateString()
                        : "No Date"}
                    </td>
                    <td>
                      <span className="count">
                        {quiz.score || 0} / {quiz.total_questions}
                      </span>
                    </td>
                    <td>{quiz.attempt_count} times</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Progress Circles Section */}
        <div
          className="stats-grid"
          style={{ marginTop: "30px", marginBottom: "30px" }}
        >
          {/* Course Completion Circle */}
          <div
            className="stat-card"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px",
            }}
          >
            <p
              style={{
                color: "#868484",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "15px",
              }}
            >
              COURSE COMPLETION
            </p>
            <div
              style={{ position: "relative", width: "120px", height: "120px" }}
            >
              <svg width="120" height="120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#5e5e5e1a"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#ffcc00"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray="314"
                  strokeDashoffset={314 - (314 * overallCourseProgress) / 100}
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
                  color: "#868484",
                }}
              >
                {overallCourseProgress}%
              </div>
            </div>
          </div>

          {/* Quiz Performance Circle */}
          <div
            className="stat-card"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px",
            }}
          >
            <p
              style={{
                color: "#868484",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "15px",
              }}
            >
              QUIZ PERFORMANCE
            </p>
            <div
              style={{ position: "relative", width: "120px", height: "120px" }}
            >
              <svg width="120" height="120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#5e5e5e1a"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#4caf50"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray="314"
                  strokeDashoffset={314 - (314 * overallQuizProgress) / 100}
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
                  color: "#868484",
                }}
              >
                {overallQuizProgress}%
              </div>
            </div>
          </div>
        </div>

        {/* Centered Download Button */}
        <div className="download-btn-container">
          <button onClick={downloadPDF} className="review-btn">
            <Download size={20} /> Download PDF Report
          </button>
        </div>

        {/* Back Button */}
        <button
          className="floating-back-btn"
          onClick={() => navigate("/all-students")}
        >
          <ArrowLeft size={20} style={{ marginRight: "8px" }} /> BACK TO LIST
        </button>
      </main>
    </div>
  );
}
