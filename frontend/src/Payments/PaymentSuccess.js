import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ color: "green" }}>✅ Payment Successful!</h1>
      <p>ඔබේ ගෙවීම සාර්ථකයි. දැන් ඔබට පාඨමාලාවට පිවිසිය හැක.</p>
      <button onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
    </div>
  );
}