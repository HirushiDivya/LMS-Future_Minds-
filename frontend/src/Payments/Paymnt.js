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

  // Payment ID
  const [lastPaymentId, setLastPaymentId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("userID");
    setCurrentUserID(id);
    if (!state) {
      alert("Invalid Access");
      navigate("/all-courses");
    }
  }, [state, navigate]);

  if (!state) return null;

  const { title, courseName, price, courseId, quiz_id, type } = state;
  const displayName = title || courseName;
  const isQuiz = type === "QUIZ";

  // --- Stripe Payment Handler ---
  const handleStripePayment = async () => {
    setIsSubmitting(true);
    const studentId = localStorage.getItem("userID");
    try {
      const response = await API.post("/pgateway/create-checkout-session", {
        student_id: studentId,
        amount: price,
        quiz_id: isQuiz ? quiz_id || state.id : null,
        course_id: !isQuiz ? courseId : null,
      });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Stripe Checkout failed:", error);
      alert("Unable to connect to the payment gateway..");
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
      alert("Please upload your bank receipt (slip) to proceed.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("slip", selectedFile);
    formData.append("student_id", Number(currentUserID));
    formData.append("amount", price);

    // Unique Invoice Number(Bank Payment (slip))
    const datePart = Date.now().toString().slice(-6);
    const generatedInvoiceNo = isQuiz 
      ? `INV-QZ-${quiz_id || state.id}-${datePart}` 
      : `INV-CR-${courseId}-${datePart}`;
    
    formData.append("invoice_number", generatedInvoiceNo);

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

      // if success navigate to success page with paymnt id
      if (response.data.paymentId) {
        const pId = response.data.paymentId;
        const typeParam = isQuiz ? 'quiz' : 'course';
        
        // method=bank -> Success page -> succesfully message 
        navigate(`/success?order_id=${pId}&type=${typeParam}&method=bank`);
      } else {
        alert(response.data.message);
        navigate(isQuiz ? "/s-allquiz" : "/all-courses");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert(err.response?.data?.error || "Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };


  
  // Invoice Download Function
  const downloadInvoice = () => {
    const typeParam = isQuiz ? "quiz" : "course";
    const url = `http://localhost:5000/api/pgateway/generate-invoice/${lastPaymentId}?type=${typeParam}`;
    window.open(url, "_blank");
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
            💳 Card Payment (Stripe)
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
            <p>You will be redirected to Stripe’s secure payment gateway.</p>
            <button
              className="register-btn"
              onClick={handleStripePayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Pay with Card"}
            </button>
          </div>
        ) : (
          <div className="slip-upload-container">
            <div className="bank-details">
              <p>
                <b>Bank:</b> Sample Bank PLC
              </p>
              <p>
                <b>Acc No:</b> 123456789
              </p>
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
                  📷 Click to upload Bank Slip
                </div>
              ) : (
                <div className="preview-container">
                  <img src={preview} alt="Slip Preview" />
                </div>
              )}
            </div>

            {!lastPaymentId ? (
              <button
                className="register-btn"
                onClick={handleBankSlipSubmit}
                disabled={isSubmitting || !selectedFile}
              >
                {isSubmitting ? "Uploading..." : "Submit Bank Slip"}
              </button>
            ) : (
              // after successfuly upload disply invoice Button 
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "green", fontWeight: "bold" }}>
                  ✔ Upload Successful!
                </p>
                <button
                  className="register-btn"
                  onClick={downloadInvoice}
                  style={{ background: "#28a745" }}
                >
                  📄 Download Invoice (PDF)
                </button>
                <button
                  className="cancel-link"
                  onClick={() =>
                    navigate(isQuiz ? "/s-allquiz" : "/all-courses")
                  }
                >
                  Go to My Courses
                </button>
              </div>
            )}
          </div>
        )}

        <button className="cancel-link" onClick={() => navigate(-1)}>
          Cancel and Go Back
        </button>
      </div>
    </div>
  );
}

