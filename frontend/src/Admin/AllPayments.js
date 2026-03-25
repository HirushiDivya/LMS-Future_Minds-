import React, { useState, useEffect } from "react";
import API from "../API";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // autoTable එක කෙලින්ම import කරන්න
import "../Admin/css/Admindashbord.css";
import { useNavigate } from "react-router-dom";

export default function AllPayments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await API.get("/admin/course/all-enrollments");
      setEnrollments(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      setLoading(false);
    }
  };

  // PDF එක Generate කරන Function එක
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header Dark Blue Bar (Dashboard Theme එකට ගැලපෙන ලෙස)
    doc.setFillColor(0, 35, 71); // Dark Blue (#002347)
    doc.rect(0, 0, pageWidth, 40, "F");

    // 2. Report Title
    doc.setTextColor(255, 204, 0); // Gold Color (#ffcc00)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT REPORT", pageWidth / 2, 25, { align: "center" });

    // 3. Report Info Section
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Requests: ${enrollments.length}`, 15, 50);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 15, 57);

    // 4. Data Table
    const tableColumn = [
      "Student Name",
      "Course Name",
      "Price",
      "Method",
      "Date",
    ];

    const tableRows = enrollments.map((item) => [
      item.student_name,
      item.course_name,
      `LKR ${item.course_price}`,
      item.payment_method,
      new Date(item.enroll_date).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: 65,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [0, 35, 71], // Header එකටත් Dark Blue
        textColor: [255, 204, 0], // Header Text එකට Gold
        fontSize: 11,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      margin: { left: 15, right: 15 },
      // Status එක අනුව පාට වෙනස් කිරීම (Conditional Styling)
    });

    // 5. Footer (පිටු අංකය පෙන්වීමට)
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" },
      );
    }

    // 6. Save PDF
    doc.save(`Enrollment_Report_${new Date().getTime()}.pdf`);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await API.put(`/admin/course/verify-payment/${id}`, {
        status: newStatus,
      });

      setEnrollments((prev) =>
        prev.map((item) =>
          item.enrollment_id === id
            ? { ...item, payment_status: newStatus }
            : item,
        ),
      );

      Swal.fire({
        icon: "success",
        title: res.data.message,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error("Update failed:", err);
      const errorMsg = err.response?.data?.message || "Update failed!";
      Swal.fire({ icon: "warning", title: "අවධානය!", text: errorMsg });
      fetchEnrollments();
    }
  };

  if (loading)
    return <div className="loading-screen">දත්ත පූරණය වෙමින් පවතී...</div>;

  return (
    <div className="admin-dashboard-wrapper">
      <main className="admin-main-content">
        <header
          className="content-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 className="dashboard-title-text">Enrollment Requests 🎓</h1>

          {/* PDF Download Button එක */}
        </header>

        <div className="card-panel admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student & Email</th>
                <th>Course Name</th>
                <th>Price</th>
                <th>Method</th>
                <th>Enroll Date</th>
                <th>Payment Slip</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((item) => (
                <tr key={item.enrollment_id} className="table-row-hover">
                  <td className="student-info">
                    <span className="student-name">{item.student_name}</span>
                    <span className="student-email-sub">
                      {item.student_email}
                    </span>
                  </td>
                  <td>{item.course_name}</td>
                  <td className="text-center">LKR {item.course_price}</td>
                  <td className="text-center">{item.payment_method}</td>
                  <td className="text-center">
                    {new Date(item.enroll_date).toLocaleDateString()}
                  </td>
                  <td className="text-center">
                    {item.payment_slip ? (
                      <img
                        src={`http://localhost:5000/${item.payment_slip.replace(/\\/g, "/")}`}
                        alt="Slip"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          Swal.fire({
                            imageUrl: `http://localhost:5000/${item.payment_slip.replace(/\\/g, "/")}`,
                            title: "Payment Slip",
                            confirmButtonColor: "#002347",
                          });
                        }}
                      />
                    ) : (
                      <span style={{ color: "red", fontSize: "12px" }}>
                        No Slip
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <button
              onClick={generatePDF}
              className="downloade-btn"
              style={{
                backgroundColor: "#e67e22",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              📥 Download PDF Report
            </button>
          </div>
        </div>
      </main>
      <button
        className="view-btn"
        onClick={() => navigate("/a-dashbord")}
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
        ← BACK TO DASHBORD
      </button>
    </div>
  );
}
