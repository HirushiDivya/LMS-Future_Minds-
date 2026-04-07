import React, { useState, useEffect } from "react";
import API from "../API";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../Admin/css/Admindashbord.css";
import { useNavigate } from "react-router-dom";
 
export default function AllPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await API.get("/admin/all-payments");
      setPayments(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(0, 35, 71);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 204, 0);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("ALL PAYMENTS REPORT", pageWidth / 2, 25, { align: "center" });

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.text(`Total Records: ${payments.length}`, 15, 50);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 15, 57);

    const tableColumn = [
      "Student",
      "Item Name",
      "Type",
      "Amount",
      "Method",
      "Status",
      "Date",
    ];
    const tableRows = payments.map((item) => [
      item.student_name,
      item.item_name,
      item.type, // Course or Quiz
      `LKR ${item.amount}`,
      item.payment_method,
      item.status,
      new Date(item.date).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: 65,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [0, 35, 71], textColor: [255, 204, 0] },
    });

    doc.save(`All_Payment_Report_${new Date().getTime()}.pdf`);
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="admin-dashboard-wrapper" >
      <main className="admin-main-content">
        <header
          className="content-headerr"
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: "30px",
            alignItems: "center",
          }}
        >
          <h1 className="dashboard-title-text">
            All Payments (Courses & Quizzes) 💰
          </h1>
        </header>

        <div className="card-panel admin-table-container" style={{maxWidth: "1170px"}}>
          <table className="admin-table" >
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Course/Quiz Name</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Slip</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((item, index) => (
                <tr key={index} className="table-row-hover">
                  <td>{item.student_name}</td>
                  <td>
                    <span style={{ fontWeight: "bold" }}>{item.item_name}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${item.type === "Course" ? "bg-primary" : "bg-info"}`}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "5px",
                        fontSize: "12px",
                        color: "white",
                        background:
                          item.type === "Course" ? "#3498db" : "#9b59b6",
                      }}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td>LKR {item.amount}</td>
                  <td>{item.payment_method}</td>
                  <td>
                    <span
                      style={{
                        color:
                          item.status === "Approved"
                            ? "#2ecc71"
                            : item.status === "Pending"
                              ? "#f1c40f"
                              : "#e74c3c",
                        fontWeight: "bold",
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td className="text-center">
                    {item.payment_slip ? (
                      <img
                        src={`http://localhost:5000/${item.payment_slip.replace(/\\/g, "/")}`}
                        alt="Slip"
                        style={{
                          width: "35px",
                          height: "35px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          Swal.fire({
                            imageUrl: `http://localhost:5000/${item.payment_slip.replace(/\\/g, "/")}`,
                            title: "Payment Slip",
                            confirmButtonColor: "#002347",
                          })
                        }
                      />
                    ) : (
                      <span style={{ color: "#aeb0b1", fontSize: "12px" }}>
                        Online/No Slip
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="download-btn-container">
          <button onClick={generatePDF} className="review-btn" style={{marginTop: "20px"}}>
            📥 Download Payment Report
          </button>
        </div>
      </main>

      <button
        className="floating-back-btn"
        onClick={() => navigate("/a-dashbord")}
      >
        ← BACK TO DASHBOARD
      </button>
    </div>
  );
}
