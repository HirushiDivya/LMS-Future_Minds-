import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../API";
import "../Admin/css/quiz.css";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("gateway");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserID, setCurrentUserID] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("userID");
    setCurrentUserID(id);
    if (!state) {
      alert("Invalid Access");
      navigate("/");
    }
  }, [state, navigate]);

  if (!state) return null;

  const { title, courseName, price, courseId, quiz_id, type } = state;
  const displayName = title || courseName;
  const isQuiz = type === "QUIZ";

  // ✅ FIX 1: ngrok URL එක මෙතන දාන්න
  // Payment.js - line 15 වෙනස් කරන්න
const NGROK_URL = "https://percolative-horace-willfully.ngrok-free.dev";
  const handleOnlinePayment = async () => {
    setIsSubmitting(true);
    const studentId = localStorage.getItem("userID");

    try {
      // Step 1: Backend එකේ Order record හදනවා
      const initiateRes = await API.post("/pgateway/initiate", {
        student_id: studentId,
        amount: price,
        quiz_id: isQuiz ? quiz_id || state.id : null,
        course_id: !isQuiz ? courseId : null,
      });
      const order_id = initiateRes.data.order_id;

      // Step 2: Hash ලබාගන්නවා
      const hashRes = await API.post("/pgateway/generate-hash", {
        order_id: order_id,
        amount: price,
        currency: "LKR",
      });
      const { hash } = hashRes.data;

      const formattedPrice = Number(price).toFixed(2);

      // ✅ FIX 2: notify_url එකට ngrok URL දාලා
      const paymentData = {
        sandbox: true,
        merchant_id: "1234249",
        return_url: "http://localhost:3000/payment-success",
        cancel_url: "http://localhost:3000/payment-fail",
        notify_url: `${NGROK_URL}/api/pgateway/payment-notify`, // ✅ Fixed
        order_id: order_id,
        items: displayName,
        amount: formattedPrice,
        currency: "LKR",
        hash: hash,
        first_name: "Student",
        last_name: String(studentId),
        email: "student@email.com",
        phone: "0771234567",
        address: "Colombo",
        city: "Colombo",
        country: "Sri Lanka",
      };

      // Step 3: PayHere වෙත submit කිරීම
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout";

      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("ගෙවීම් පද්ධතියට සම්බන්ධ වීමට නොහැකි විය. නැවත උත්සාහ කරන්න.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleBankSlipSubmit = async () => {
    if (!selectedFile) {
      alert("කරුණාකර බැංකු රිසිට්පත (Slip) ලබා දෙන්න.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("slip", selectedFile);
    formData.append("student_id", Number(currentUserID));
    formData.append("amount", price);

    const endpoint = isQuiz
      ? "/payment/quiz/upload-bank-slip"
      : "/payment/course/upload-bank-slip";

    if (isQuiz) {
      formData.append("quiz_id", Number(quiz_id || state.id));
    } else {
      formData.append("course_id", Number(courseId));
    }

    try {
      const response = await API.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message);
      navigate(isQuiz ? "/all-quizzes" : "/all-courses");
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card profile-card-wide">
        <h2>{isQuiz ? "Quiz" : "Course"} Enrollment</h2>
        <p>Complete your payment to unlock access</p>

        <div className="summary-section">
          <h3 className="item-name">{displayName}</h3>
          <p className="price-tag">LKR {price}</p>
        </div>

        <div className="mini-navbar">
          <button
            className={paymentMethod === "gateway" ? "active-tab" : ""}
            onClick={() => setPaymentMethod("gateway")}
          >
            💳 Online Pay
          </button>
          <button
            className={paymentMethod === "slip" ? "active-tab" : ""}
            onClick={() => setPaymentMethod("slip")}
          >
            🏦 Bank Slip
          </button>
        </div>

        {paymentMethod === "gateway" ? (
          <div className="gateway-info">
            <p style={{ marginBottom: "20px" }}>
              You will be redirected to our secure payment gateway to pay instantly.
            </p>
            <button
              className="register-btn"
              onClick={handleOnlinePayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Pay via PayHere"}
            </button>
          </div>
        ) : (
          <div className="slip-upload-container">
            <div className="bank-details">
              <p><b>Bank:</b> Sample Bank PLC</p>
              <p><b>Acc No:</b> 123456789</p>
              <p><b>Name:</b> Future Minds Institute</p>
            </div>

            <div className="file-drop-area">
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/*"
                className="file-input"
              />
              {!preview ? (
                <div className="upload-placeholder">
                  <div className="icon">📷</div>
                  <p>Click to upload Bank Slip</p>
                </div>
              ) : (
                <div className="preview-container">
                  <img src={preview} alt="Slip Preview" />
                  <p className="success-text">✔ Slip selected</p>
                </div>
              )}
            </div>

            <button
              className="register-btn"
              onClick={handleBankSlipSubmit}
              disabled={isSubmitting || !selectedFile}
              style={{ background: selectedFile ? "" : "#555" }}
            >
              {isSubmitting ? "Uploading..." : "Submit Bank Slip"}
            </button>
          </div>
        )}

        <button className="cancel-link" onClick={() => navigate(-1)}>
          Cancel and Go Back
        </button>
      </div>
    </div>
  );
}