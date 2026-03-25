import { useState } from "react";
import { useNavigate } from "react-router-dom"; // මුලින්ම useNavigate import කරගන්න
import API from "../API";
import "./StudentRegister.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
const navigate = useNavigate();
  const sendOtp = async () => {
    try {
      const res = await API.post("/login/forgot-password", { email });
      alert(res.data.message);

      navigate("/fpw-verify-otp", { state: { email: email } });
    } catch (err) {
      alert(err.response?.data?.message || "Error occurred!");
    }
  };

  const contactSupport = () => {
    const phone = "94761758959";
    
    // මෙතනදී trim() එකක් දාන්න හිස් තැන් ඉවත් වෙන්න
    const userEmail = email ? email : "[Email not provided]";
    const message = `Hi, I'm having trouble resetting my password. (Email: ${userEmail})`;
    
    // encodeURIComponent එක හරියටම වැඩ කරනවා නේද කියලා බලන්න
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Reset Password 🔒</h2>
        <p>Enter your email to receive an OTP</p>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // State එක update වීම මෙතනදී වෙනවා
          />
        </div>

        <button className="register-btn" onClick={sendOtp}>
          Send OTP
        </button>

        <div className="form-footer">
          <span onClick={() => window.history.back()} style={{ cursor: "pointer" }}>← Back</span>

          <span
            onClick={contactSupport}
            style={{ cursor: "pointer", fontWeight: "500" }}
          >
            Need Help?
          </span>
        </div>
      </div>
    </div>
  );
}