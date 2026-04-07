import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../API";
import "./StudentRegister.css"; 

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    // Registration ->  email 
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const verify = async () => {
    try {
    
      const res = await API.post("/register/verify-otp", { email, otp });
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Verify OTP ✉️</h2>
        <p>Enter the code sent to your email</p>

        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            value={email} 
            readOnly 
            placeholder="example@mail.com" 
          />
        </div>

        <div className="form-group">
          <label>One-Time Password (OTP)</label>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        <button className="register-btn" onClick={verify}>
          Verify & Register
        </button>

        <div className="form-footer">
          <span onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>← Back</span>
          <span onClick={() => alert("Resending OTP...")}>Resend OTP</span>
        </div>
      </div>
    </div>
  );
}
