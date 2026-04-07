import React, { useEffect } from "react"; 
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios"; 


export default function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("order_id");
  const type = searchParams.get("type");
  const method = searchParams.get("method"); // 'bank' or 'online'

  const handleDownload = () => {
    // Backend -> generate-invoice endpoint 
    const url = `http://localhost:5000/api/pgateway/generate-invoice/${orderId}?type=${type}`;
    window.open(url, "_blank");
  };

useEffect(() => {
  const confirm = async () => {
    if (orderId && type && method !== 'bank') { // Stripe 
      try {
        // Invoice Number (INV-00001 format )
        const generatedInvoiceNo = `INV-${orderId.toString().padStart(5, "0")}`;

        await axios.post("http://localhost:5000/api/pgateway/confirm-payment", {
          order_id: orderId,
          type: type,
          invoice_number: generatedInvoiceNo // send new Invoice Number 
        });
        console.log("Payment Confirmed & Invoice Number Updated!");
      } catch (err) {
        console.error("Update failed", err);
      }
    }
  };
  confirm();
}, [orderId, type, method]);

  return (
    <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "Arial" }}>
      <div style={{ fontSize: "70px", marginBottom: "20px" }}>
        {method === 'bank' ? "⏳" : "🎉"}
      </div>

      <h1 style={{ color: method === 'bank' ? "#ff9800" : "#28a745", marginBottom: "10px" }}>
        {method === 'bank' ? "Slip Uploaded Successfully!" : "Payment Successful!"}
      </h1>
      
      <p style={{ fontSize: "18px", color: "#555", maxWidth: "600px", margin: "0 auto 30px" }}>
        {method === 'bank' 
          ? "Our team will verify your receipt and grant course access shortly. In the meantime, you may download and keep your payment receipt." 
          : "Your payment has been processed successfully. You may now begin your learning journey."}
      </p>

      <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
        <button 
          onClick={handleDownload}
          style={{ 
            padding: "12px 25px", 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "5px", 
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          📄 Download Invoice (PDF)
        </button>

        <button 
          onClick={() => navigate(type === 'quiz' ? "/s-allquiz" : "/all-courses")} 
          style={{ 
            padding: "12px 25px", 
            background: "#fff", 
            border: "1px solid #007bff", 
            color: "#007bff",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          My Courses
        </button>
      </div>
    </div>
  );
}
  