import React, { useState, useEffect } from "react";
import API from "../../API";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; 
//import "../StudentRegister.css";
import "./ViewQuiz.css";

const ViewQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [studentStatus, setStudentStatus] = useState("Active");

  useEffect(() => {
    if (id) {
      fetchQuizData();
    }
  }, [id]);

  /*
  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const studentId = localStorage.getItem("userID");

      const detailsRes = await API.get(`/quiz/quiz/${id}`);
      setQuizData(detailsRes.data);

      if (studentId) {
        try {
          const statusRes = await API.get(`/admin/student/quiz-payments/${studentId}`);
          const currentPayment = statusRes.data.find(
            (p) => p.quiz_name === detailsRes.data.title
          );

          if (currentPayment) {
            setPaymentStatus(currentPayment.status);
          }
        } catch (err) {
          console.log("No payment record.");
        }

        
        try {
          const questionsRes = await API.get(`/quiz/get-questions/${id}?studentId=${studentId}`);
          setQuestions(questionsRes.data);
          setIsApproved(true);
        } catch (err) {
          setIsApproved(false);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };
*/


const fetchQuizData = async () => {
    try {
      setLoading(true);
      const studentId = localStorage.getItem("userID");

      const detailsRes = await API.get(`/quiz/quiz/${id}`);
      setQuizData(detailsRes.data);

      if (studentId) {
        // --- ශිෂ්‍යයාගේ Account Status එක පරීක්ෂා කිරීම ---
        try {
          const enrollRes = await API.get(`/enroll/my-dashboard/${studentId}`);
          if (enrollRes.data.length > 0) {
            setStudentStatus(enrollRes.data[0].student_account_status);
          }
        } catch (err) {
          console.error("Status fetch error");
        }

        try {
          const statusRes = await API.get(`/admin/student/quiz-payments/${studentId}`);
          const currentPayment = statusRes.data.find(
            (p) => p.quiz_name === detailsRes.data.title
          );

          if (currentPayment) {
            setPaymentStatus(currentPayment.status);
          }
        } catch (err) {
          console.log("No payment record.");
        }

        try {
          const questionsRes = await API.get(`/quiz/get-questions/${id}?studentId=${studentId}`);
          setQuestions(questionsRes.data);
          // ශිෂ්‍යයා Active නම් පමණක් Approved කරන්න
          setIsApproved(true); 
        } catch (err) {
          setIsApproved(false);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };
  const handleEnrollRequest = () => {
    // Advanced Alert 
    if (studentStatus === "Deactive") {
      Swal.fire({
        title: "Account Suspended!",
        text: "You cannot purchase quizzes. Please contact admin.",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    if (paymentStatus === "Pending") {
      Swal.fire({
        title: "Payment Pending!",
        text: "You have already submitted the payment receipt. Please wait for admin verification.",
        icon: "info",
        confirmButtonColor: "#facc15",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    
    }

    const userId = localStorage.getItem("userID");
    if (!userId) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to purchase this quiz.",
        icon: "warning",
        confirmButtonText: "Go to Login",
        showCancelButton: true,
        background: "#1f2937",
        color: "#fff",
      }).then((result) => {
        if (result.isConfirmed) navigate("/login");
      });
      return;
    }

    navigate(`/qpayment`, {
      state: { title: quizData.title, price: quizData.price, id: id, type: "QUIZ" },
    });
  };

  if (loading) return <div className="register-page"><h2 style={{ color: "white" }}>Loading...</h2></div>;
  if (!quizData) return <div className="register-page"><h2 style={{ color: "white" }}>Quiz Not Found</h2></div>;

  return (
    <div className="viewquiz-page">
      <div className="register-card profile-card-widequiz" style={{ maxWidth: "800px" }}>
        <div >
          <div style={{ textAlign: "left" }}>
            <h2 className="SViewquiz-header">{quizData.title}</h2>
            {/*<p style={{ opacity: 0.8 }}>{isApproved ? "Examination Unlocked" : "Locked Content"}</p> */}
          </div>
        </div>

        <div className="table-responsive" style={{ background: "rgba(255,255,255,0.1)", borderRadius: "15px", padding: "10px", marginBottom: "30px" }}>
          <table className="students-table" style={{ width: "100%", color: "white" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                <th>Questions</th>
                <th>Time Limit</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="SViewQuiz-tble-data">
              <tr>
                <td>{quizData.questions_count || questions.length}</td>
                <td>{quizData.time_limit_minutes} Mins</td>
                <td>Rs. {quizData.price}</td>
                <td>
                  <span style={{ color: isApproved ? "#4ade80" : "#f87171", fontWeight: "bold" }}>
                    ● {isApproved ? "UNLOCKED" : (paymentStatus === "Pending" ? "PENDING" : "LOCKED")}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
 
        {/*<div style={{ textAlign: "center" }}>
          {isApproved ? (
            <button className="view-btn" onClick={() => navigate(`/questions/${id}`)}>
              🚀 Start Quiz Now
            </button>
          ) : (
            <div className="locked-section" >
              <div style={{ fontSize: "50px", marginBottom: "15px" }}>
                {paymentStatus === "Pending" ? "⏳" : "🔒"}
              </div>
              <h3 style={{ color: "#facc15" }}>
                {paymentStatus === "Pending" ? "Approval in Progress" : "Unlock this Quiz"}
              </h3>
              <p className="payment-sentsnce" >
                {paymentStatus === "Pending" 
                  ? "We're verifying your payment receipt. You'll be notified once access is granted." 
                  : "To access the questions, please complete the payment and upload your receipt."}
              </p>
              <button
                className="register-btn"
                onClick={handleEnrollRequest}
                style={{
                  background: paymentStatus === "Pending" ? "#4b5563" : "#facc15",
                  color: "#000",
                  fontWeight: "bold",
                  cursor: paymentStatus === "Pending" ? "not-allowed" : "pointer"
                }}
              >
                {paymentStatus === "Pending" ? "Pending Approval" : "Pay Now & Unlock"}
              </button>
            </div>
          )}
        </div>  */}

        <div style={{ textAlign: "center" }}>
  {/* ශිෂ්‍යයා Active සහ Approved නම් පමණක් Start Quiz පෙන්වන්න */}
  {isApproved && studentStatus === "Active" ? (
    <button className="view-btn" onClick={() => navigate(`/questions/${id}`)}>
      🚀 Start Quiz Now
    </button>
  ) : (
    <div className="locked-section" >
      <div style={{ fontSize: "50px", marginBottom: "15px" }}>
        {studentStatus === "Deactive" ? "🚫" : (paymentStatus === "Pending" ? "⏳" : "🔒")}
      </div>
      <h3 style={{ color: studentStatus === "Deactive" ? "#f87171" : "#facc15" }}>
        {studentStatus === "Deactive" ? "Access Denied" : (paymentStatus === "Pending" ? "Approval in Progress" : "Unlock this Quiz")}
      </h3>
      <p className="payment-sentsnce" >
        {studentStatus === "Deactive" 
          ? "Your account has been suspended. Access to all quizzes is currently blocked." 
          : (paymentStatus === "Pending" 
              ? "We're verifying your payment receipt." 
              : "To access the questions, please complete the payment.")}
      </p>
      
      {/* Deactive නම් 'Pay Now' button එක හංගන්න හෝ වෙනස් කරන්න */}
      {studentStatus !== "Deactive" && (
        <button
          className="register-btn"
          onClick={handleEnrollRequest}
          style={{
            background: paymentStatus === "Pending" ? "#4b5563" : "#facc15",
            color: "#000",
            fontWeight: "bold",
            cursor: paymentStatus === "Pending" ? "not-allowed" : "pointer"
          }}
        >
          {paymentStatus === "Pending" ? "Pending Approval" : "Pay Now & Unlock"}
        </button>
      )}
    </div>
  )}
</div>

      </div>
      <div style={{ marginTop: "50px" }}>
        <button className="floating-back-btn" onClick={() => navigate("/a-dashbord")}>
          ← BACK TO Quizes
        </button>
      </div>
    </div>
  );
};

export default ViewQuiz;
