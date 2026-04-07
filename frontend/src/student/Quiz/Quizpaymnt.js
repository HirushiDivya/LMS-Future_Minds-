import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../API"; // ඔබේ folder structure එකට අනුව path එක නිවැරදි කරගන්න
import "../StudentRegister.css";
//import "./ViewQuiz.css";


export default function QuizPayment() {
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

    // වැරදි විදිහට page එකට ආවොත් back කරනවා
    if (!state || !state.id) {
      alert("Invalid Access. Redirecting back...");
      navigate(-1);
    }
  }, [state, navigate]);

  if (!state) return null;

  // Destructure data from state
  const { id, title, price, type } = state;
  const isQuiz = type === "QUIZ" || !type; // Default quiz ලෙස සලකයි
  const displayName = title;

  // --- Stripe Payment Handler ---
  const handleStripePayment = async () => {
    setIsSubmitting(true);
    try {
      const response = await API.post("/pgateway/create-checkout-session", {
        student_id: currentUserID,
        amount: price,
        quiz_id: id,
        course_id: null, // මෙය Quiz Payment එකක් නිසා
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Stripe Checkout failed:", error);
      alert("ගෙවීම් පද්ධතියට සම්බන්ධ වීමට නොහැකි විය.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Bank Slip Handlers ---
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
  
  // ✅ 1. Invoice Number එක මෙතැනදී සාදා ගන්න
  const datePart = Date.now().toString().slice(-6);
  const generatedInvoiceNo = `INV-QZ-${id}-${datePart}`;

  const formData = new FormData();
  formData.append("slip", selectedFile);
  formData.append("student_id", currentUserID);
  formData.append("quiz_id", id);
  formData.append("amount", price);
  formData.append("invoice_number", generatedInvoiceNo); // send to Backend 

  try {
    const res = await API.post("/payment/quiz/upload-bank-slip", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.data.paymentId) {
      navigate(`/success?order_id=${res.data.paymentId}&type=quiz&method=bank`);
    } else {
      alert(res.data.message || "Upload successful.");
      navigate(-1);
    }
  } catch (err) {
    alert(err.response?.data?.error || "Upload failed.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="register-page">
      <div
        className="register-card profile-card-wide"
        style={{ maxWidth: "550px" }}
      >
        <h2>Quiz Enrollment</h2>
        <p>Complete your payment to unlock access</p>

        <div className="summary-section">
          <h3 className="item-name" style={{ color: "#facc15" }}>
            {displayName}
          </h3>
          <p className="price-tag" style={{ fontSize: "1.5rem" }}>
            LKR {price}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mini-navbar">
          <button
            className={paymentMethod === "gateway" ? "active-tab" : ""}
            onClick={() => setPaymentMethod("gateway")}
          >
            💳 Card Payment (Stripe)
          </button>
          <button
            className={paymentMethod === "slip" ? "active-tab" : ""}
            onClick={() => setPaymentMethod("slip")}
          >
            🏦 Bank Slip
          </button>
        </div>

        {/* Content based on Tab */}
        {paymentMethod === "gateway" ? (
          <div className="gateway-info">
            <p style={{ marginBottom: "20px", color: "rgba(255,255,255,0.8)" }}>
              You will be redirected to Stripe’s secure payment gateway.
            </p>
            <button
              className="register-btn"
              onClick={handleStripePayment}
              disabled={isSubmitting}
              style={{ background: "#4ade80", color: "#000" }}
            >
              {isSubmitting ? "Processing..." : "Pay Instantly via Card"}
            </button>
          </div>
        ) : (
          <div className="slip-upload-container">
            <div
              className="bank-details"
              style={{ textAlign: "left", fontSize: "0.9rem" }}
            >
              <p>
                <b>Bank:</b> Bank of Ceylon (BOC)
              </p>
              <p>
                <b>Acc Name:</b> Exam Center PLC
              </p>
              <p>
                <b>Acc No:</b> 1234567890
              </p>
            </div>

            <div className="file-drop-area" style={{ marginTop: "15px" }}>
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/*"
                className="file-input"
              />
              {!preview ? (
                <div className="upload-placeholder">
                  <div style={{ fontSize: "2rem" }}>📷</div>
                  <p>Click to upload Bank Slip</p>
                </div>
              ) : (
                <div className="preview-container">
                  <img
                    src={preview}
                    alt="Slip Preview"
                    style={{ maxHeight: "150px" }}
                  />
                  <p style={{ color: "#4ade80", fontSize: "0.8rem" }}>
                    ✔ Slip Selected
                  </p>
                </div>
              )}
            </div>

            <button
              className="register-btn"
              onClick={handleBankSlipSubmit}
              disabled={isSubmitting || !selectedFile}
              style={{
                marginTop: "20px",
                background: selectedFile ? "#facc15" : "#555",
              }}
            >
              {isSubmitting ? "Uploading..." : "Submit Bank Slip"}
            </button>
          </div>
        )}

        <button
          className="cancel-link"
          onClick={() => navigate(-1)}
          style={{ marginTop: "20px", display: "block", width: "100%" }}
        >
          Cancel and Go Back
        </button>
      </div>
    </div>
  );
}
