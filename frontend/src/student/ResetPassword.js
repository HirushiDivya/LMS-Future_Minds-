import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../API";
import "./StudentRegister.css"; // කලින් ලස්සන CSS එකම පාවිච්චි කරන්න

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || ""); //1.get email 
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
   if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await API.post("/login/reset-password", {
        email,
        newPassword,
      });
      alert(res.data.message);
      navigate("/login"); // සාර්ථක වුණාම login එකට යනවා
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed");
    }
  };
 
return (
    <div className="register-page">
      <div className="register-card">
        <h2>New Password 🔑</h2>
        <p>Set a strong password for your account</p>

        <form onSubmit={handleReset}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              readOnly // Email එක වෙනස් කරන්න බැරි වෙන්න දාන්න
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="register-btn" type="submit">
            Reset Password
          </button>
        </form>

        <div className="form-footer">
          <span onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>
            Return to Login
          </span>
        </div>
      </div>
    </div>
  );
}
