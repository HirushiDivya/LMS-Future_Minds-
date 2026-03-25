import React, { useState, useEffect } from "react";
import API from "../API";
import Swal from "sweetalert2";
import "../Admin/css/Admindashbord.css";

export default function QuizEnrollmntReq() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ඔබේ Backend එකේ Base URL එක මෙතැනට ලබා දෙන්න
  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await API.get("/admin/quiz/all-paymntrequests");
      setEnrollments(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      setLoading(false);
    }
  };

  // පින්තූරය ලොකුවට පෙන්වීමට භාවිතා කරන function එක
  const showFullImage = (slipPath) => {
    const fullUrl = `${BACKEND_URL}/${slipPath.replace(/\\/g, "/")}`;
    Swal.fire({
      imageUrl: fullUrl,
      imageAlt: "Payment Slip",
      width: "auto",
      showConfirmButton: true,
      confirmButtonText: "Close",
      confirmButtonColor: "#002347",
    });
  };

  const handleStatusChange = async (paymentId, newStatus) => {
  // දැනටමත් Approved නම් වෙනස් කිරීමට ඉඩ නොදෙයි
  const currentItem = enrollments.find((item) => item.payment_id === paymentId);
  if (currentItem.status === "Approved") {
    Swal.fire("Attention!", "This payment is already approved.", "info");
    return;
  }

  // Pending සිට Approved හෝ Rejected ලෙස වෙනස් කිරීම
  if (newStatus === "Approved" || newStatus === "Rejected") {
    try {
      // 1. Backend එකේ අලුත් පොදු Route එක (PUT method) භාවිතා කිරීම
      const res = await API.put("/admin/quiz/verify-payment", {
        paymentId,
        status: newStatus,
      });

      // 2. සාර්ථක නම් දේශීය State එක Update කිරීම
      setEnrollments((prev) =>
        prev.map((item) =>
          item.payment_id === paymentId 
            ? { ...item, status: newStatus } 
            : item
        )
      );

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: res.data.message,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Status update error:", err);
      const errorMsg = err.response?.data?.message || "Status update failed!";
      Swal.fire("Error!", errorMsg, "error");
      
      // වැරදුනහොත් දත්ත නැවත පූරණය කිරීම (Reload)
      fetchEnrollments();
    }
  }
};

  if (loading)
    return <div className="loading-screen">දත්ත පූරණය වෙමින් පවතී...</div>;

  return (
    <div className="admin-dashboard-wrapper">
      <main className="admin-main-content">
        <header className="content-header">
          <h1 className="dashboard-title-text">Quiz Enrollment Requests 🎓</h1>
        </header>

        <div className="card-panel admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Quiz Name</th>
                <th>Price</th>
                <th>Method</th>
                <th>Payment Slip</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((item) => (
                <tr key={item.payment_id} className="table-row-hover">
                  <td>{item.student_name}</td>
                  <td>{item.quiz_name}</td>
                  <td>LKR {item.amount}</td>
                  <td>{item.payment_method}</td>
                  <td className="text-center">
                    {item.payment_slip ? (
                      <div
                        style={{ cursor: "pointer" }}
                        onClick={() => showFullImage(item.payment_slip)}
                      >
                        <img
                          // Path එකේ තියෙන \\ වෙනුවට / දමා URL එක සකසයි
                          src={`${BACKEND_URL}/${item.payment_slip.replace(/\\/g, "/")}`}
                          alt="Slip"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                          }}
                        />
                        <p
                          style={{
                            fontSize: "10px",
                            margin: 0,
                            color: "#002347",
                          }}
                        >
                          View
                        </p>
                      </div>
                    ) : (
                      <span className="no-slip-text">No Slip</span>
                    )}
                  </td>
                  <td className="text-center">
                    <select
                      className={`status-select ${item.status.toLowerCase()}`}
                      value={item.status}
                      disabled={item.status === "Approved"}
                      onChange={(e) =>
                        handleStatusChange(item.payment_id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {enrollments.length === 0 && (
            <p style={{ textAlign: "center", padding: "20px" }}>
              No requests found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
