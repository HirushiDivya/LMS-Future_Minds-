import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ color: "red" }}>❌ Payment Failed!</h1>
      <p>Transaction unsuccessful. Please try again later.</p>
      <button onClick={() => navigate(-1)}>Try Again</button>
    </div>
  );
}