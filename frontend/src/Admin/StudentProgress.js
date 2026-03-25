import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../API";
import "../Admin/css/StudentProgress.css"; // CSS file එක මෙතැනින් import කරන්න
import { AlignCenter } from "lucide-react";

export default function StudentProgress() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/students/student-stats/${id}`)
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, [id]);

const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header Blue Bar
    doc.setFillColor(0, 21, 41); // Dark Blue (Matches your theme)
    doc.rect(0, 0, pageWidth, 40, "F");

    // 2. Report Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("STUDENT PROGRESS REPORT", pageWidth / 2, 25, { align: "center" });

    // 3. Student Details Section
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Student ID: ${id}`, 15, 55);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 62);

    // 4. Enrolled Courses Table
    doc.setTextColor(76, 175, 80); // Greenish text for section title
    doc.setFontSize(14);
    doc.text("Enrolled Courses", 15, 75);

    autoTable(doc, {
      startY: 80,
      head: [["Course Name", "Enroll Date", "Payment", "Progress"]],
      body: stats.enrolledCourses?.map((course) => [
        course.course_name,
        new Date(course.enroll_date).toLocaleDateString(),
        course.payment_status,
        `${course.course_progress_percentage}%`,
      ]),
      headStyles: { fillColor: [76, 175, 80], textColor: 255 }, // Green Header
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 15, right: 15 },
    });

    // 5. Quiz Activity Table
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setTextColor(33, 150, 243); // Blue text for section title
    doc.setFontSize(14);
    doc.text("Quiz Activity", 15, finalY);

    autoTable(doc, {
      startY: finalY + 5,
      head: [["Quiz Name", "Date", "Score", "Attempts", "Status"]],
      body: stats.quizActivity?.map((quiz) => [
        quiz.quiz_name,
        quiz.attempt_date ? new Date(quiz.attempt_date).toLocaleDateString() : "N/A",
        quiz.score !== null ? `${quiz.score} / ${quiz.total_questions}` : "N/A",
        quiz.attempt_count,
        quiz.payment_status || "Approved",
      ]),
      headStyles: { fillColor: [33, 150, 243], textColor: 255 }, // Blue Header
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 15, right: 15 },
    });

    // 6. Save the PDF
    doc.save(`Student_${id}_Progress_Report.pdf`);
  };

  if (loading) {
    return <div className="progress-container" style={{padding: '100px'}}><h2>Loading Progress Data...</h2></div>;
  }

  if (!stats) {
    return (
      <div className="progress-container" style={{padding: '100px'}}>
        <h2>No data found for Student ID: {id}</h2>
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
      </div>
    );
  }

  return (
    <div className="progress-container">
      {/* Header Section */}

              <h2 className="report-title">Student Progress Report</h2>

      

      {/* Courses Section */}
      <div style={{ marginBottom: "40px" }}>
        <h3 className="section-title course-title">Enrolled Courses</h3>
        <div className="table-responsive">
          <table className="students-table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Enroll Date</th>
                <th>Payment</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {stats.enrolledCourses?.map((course, index) => (
                <tr key={index}>
                  <td>{course.course_name}</td>
                  <td>{new Date(course.enroll_date).toLocaleDateString()}</td>
                  <td className={course.payment_status === "Paid" ? "status-paid" : "status-unpaid"}>
                    {course.payment_status}
                  </td>
                  <td>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${course.course_progress_percentage}%` }}
                      >
                        {course.course_progress_percentage}%
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quizzes Section */}
      <div>
        <h3 className="section-title quiz-title">Quiz Activity</h3>
        <div className="table-responsive">
          <table className="students-table">
            <thead>
              <tr>
                <th>Quiz Name</th>
                <th>Attempt Date</th>
                <th>Score</th>
                <th>Attempts</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.quizActivity?.map((quiz, index) => (
                <tr key={index}>
                  <td>{quiz.quiz_name}</td>
                  <td>{quiz.attempt_date ? new Date(quiz.attempt_date).toLocaleDateString() : "Not Attempted"}</td>
                  <td className="score-text">
                    {quiz.score !== null ? `${quiz.score} / ${quiz.total_questions}` : "N/A"}
                  </td>
                  <td>{quiz.attempt_count}</td>
                  <td>{quiz.payment_status || "Free"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-header-wrapper" >
        <div className="button-group">
          <button onClick={downloadPDF} className="download-btn">Download PDF</button>
          </div>
          <div className="button-group2">
        </div>
      </div>
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
}