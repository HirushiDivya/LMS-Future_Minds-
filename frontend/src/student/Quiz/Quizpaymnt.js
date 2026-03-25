import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../API";
import "../StudentRegister.css";

const QuizPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { id, title, price } = location.state || {};
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // Slip එක පෙන්වීමට
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) {
      alert("Invalid Access. Redirecting back...");
      navigate(-1);
    }
  }, [id, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); // Preview එකක් සෑදීම
    }
  };

  const handleOnlinePayment = async () => {
    const studentId = localStorage.getItem("userID");
    try {
      setUploading(true);
      if (!price) {
        alert("Price information missing.");
        return;
      }
      const formattedPrice = Number(price).toFixed(2);

      const initRes = await API.post("/pgateway/initiate", {
        student_id: studentId,
        quiz_id: id,
        amount: formattedPrice,
      });

      const orderId = initRes.data.order_id;
      const hashRes = await API.post("/pgateway/generate-hash", {
        order_id: orderId,
        amount: formattedPrice,
        currency: "LKR",
      });

      const hash = hashRes.data.hash;

      const paymentData = {
        sandbox: true,
        merchant_id: "1234249",
        return_url: "http://localhost:3000/payment-success",
        cancel_url: "http://localhost:3000/payment-failed",
        notify_url: "http://your-live-backend-url.com/api/pgateway/payment-notify",
        order_id: orderId,
        items: title,
        amount: formattedPrice,
        currency: "LKR",
        hash: hash,
        first_name: "Student",
        last_name: studentId,
        email: "test@example.com",
        phone: "0771234567",
        address: "Colombo",
        city: "Colombo",
        country: "Sri Lanka",
      };

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
    } catch (err) {
      console.error(err);
      alert("Online payment initialization failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleBankSlipUpload = async (e) => {
    e.preventDefault();
    const studentId = localStorage.getItem("userID");
    if (!file) { alert("Please select a file first."); return; }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("slip", file);
      formData.append("student_id", studentId);
      formData.append("quiz_id", id);
      formData.append("amount", price);

      const res = await API.post("/payment/quiz/upload-bank-slip", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message);
      navigate(-1);
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card" style={{ maxWidth: "550px", textAlign: "center", padding: "30px" }}>
        <h2 style={{ color: "white", marginBottom: "20px" }}>Quiz Enrollment</h2>
        
        {/* Quiz Info */}
        <div style={{ background: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "15px", marginBottom: "25px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 style={{ margin: "5px 0", color: "#facc15" }}>{title}</h3>
          <p style={{ fontSize: "1.4rem", fontWeight: "bold", color: "white", margin: "10px 0" }}>Rs. {price}</p>
        </div>

        {/* Online Payment Option */}
        <div style={{ marginBottom: "30px" }}>
          <button
            className="view-btn"
            style={{ width: "100%", background: "#4ade80", color: "#000", fontWeight: "bold", padding: "12px", borderRadius: "10px", fontSize: "1rem" }}
            onClick={handleOnlinePayment}
            disabled={uploading}
          >
            {uploading ? "Processing..." : "💳 Pay Instantly via Card / Genie"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", margin: "25px 0", color: "rgba(255,255,255,0.3)" }}>
          <hr style={{ flex: 1, border: "0.5px solid rgba(255,255,255,0.1)" }} />
          <span style={{ margin: "0 10px", fontSize: "0.8rem" }}>OR BANK TRANSFER</span>
          <hr style={{ flex: 1, border: "0.5px solid rgba(255,255,255,0.1)" }} />
        </div>

        {/* Bank Details Section */}
        <div style={{ textAlign: "left", background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "15px", marginBottom: "20px", border: "1px dashed rgba(255,255,255,0.2)" }}>
          <h4 style={{ color: "#4ade80", marginBottom: "10px", fontSize: "1rem" }}>Bank Details:</h4>
          <div style={{ color: "white", fontSize: "0.9rem", lineHeight: "1.6" }}>
            <p><b>Bank:</b> Bank of Ceylon (BOC)</p>
            <p><b>Account Name:</b> Exam Center PLC</p>
            <p><b>Account Number:</b> 1234567890</p>
            <p><b>Branch:</b> Colombo Fort</p>
          </div>
        </div>

        {/* Advanced File Upload Area */}
        <div style={{ textAlign: "left" }}>
          <h4 style={{ color: "white", marginBottom: "10px", fontSize: "1rem" }}>Upload Your Slip:</h4>
          <form onSubmit={handleBankSlipUpload}>
            <div 
              style={{
                border: "2px dashed rgba(255,255,255,0.2)",
                borderRadius: "15px",
                padding: "20px",
                textAlign: "center",
                position: "relative",
                backgroundColor: "rgba(255,255,255,0.02)",
                cursor: "pointer",
                transition: "0.3s"
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = "#4ade80"}
              onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                required 
              />
              
              {!preview ? (
                <div>
                  <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📷</div>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
                    Click or Drag & Drop your payment slip here
                  </p>
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <img src={preview} alt="Slip Preview" style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "10px" }} />
                  <p style={{ color: "#4ade80", fontSize: "0.8rem", marginTop: "10px" }}>✔ Slip Selected</p>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="register-btn" 
              disabled={uploading || !file} 
              style={{ width: "100%", marginTop: "20px", padding: "12px", background: file ? "#facc15" : "#555", color: "#000", fontWeight: "bold" }}
            >
              {uploading ? "Uploading..." : "📤 Submit Payment Slip"}
            </button>
          </form>
        </div>

        <button 
          onClick={() => navigate(-1)} 
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", marginTop: "25px", cursor: "pointer", textDecoration: "underline", fontSize: "0.9rem" }}
        >
          Cancel and Go Back
        </button>
      </div>
    </div>
  );
};

export default QuizPayment;