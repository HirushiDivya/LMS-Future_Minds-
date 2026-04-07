import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../API";
import "./StudentRegister.css"; 

export default function FPWVerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  
  //  fetch email or empty
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/login/verify-forgot-otp", {
        email,
        otp,
      });
      alert(res.data.message);
      navigate("/reset-pw", { state: { email } });
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Verify OTP 🔑</h2>
        <p>Check your email for the verification code</p>

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={!!location.state?.email} // Email can not edit
            />
          </div>

          <div className="form-group">
            <label>Enter OTP</label>
            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button className="register-btn" type="submit">
            Verify OTP
          </button>
        </form>

        <div className="form-footer">
          <span onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>← Back</span>
          <span onClick={() => alert("Resending OTP...")}>Resend OTP</span>
        </div>
      </div>
    </div>
  );
}