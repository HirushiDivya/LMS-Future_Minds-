import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API";
import "./StudentRegister.css"; // Import the CSS above

export default function StudentRegister() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const register = async () => {
    try {
      const res = await API.post("/register/register", form);
      alert(res.data.message);
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      alert(err.response?.data?.message || "Server not responding.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Welcome 👋</h2>
        <p>Register to start learning</p>

        <div className="form-group">
          <label>Full Name</label>
          <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="John Doe" />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input name="email" value={form.email} onChange={handleChange} placeholder="example@mail.com" />
        </div>

        <div className="form-group">
          <label>Mobile</label>
          <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="+123456789" />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} />
        </div>

        <button className="register-btn" onClick={register}>Register</button>

        <div className="form-footer">
          <span onClick={() => navigate("/fogot-pw")}>Forgot Password?</span>
          <span onClick={() => navigate("/login")}>Already have an account?</span>
        </div>
      </div>
    </div>
  );
}