import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ color: "red" }}>❌ Payment Failed!</h1>
      <p>ගෙවීම අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න.</p>
      <button onClick={() => navigate(-1)}>Try Again</button>
    </div>
  );
}