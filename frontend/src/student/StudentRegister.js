/*import { useState } from "react";
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

*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API";
import "./StudentRegister.css";

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

  // Validation Logic
  const validateForm = async () => {
    const { full_name, email, mobile, password } = form;

    // 1. හිස්ව තිබේදැයි බැලීම
    if (!full_name || !email || !mobile || !password) {
      alert("Please fill all fields.");
      return false;
    }

    // 2. Email format එක check කිරීම (RegEx)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    // 3. Mobile number (ඉලක්කම් 10 ක් පමණක් තිබේදැයි බැලීම)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      alert("Mobile number must be exactly 10 digits.");
      return false;
    }

    // 4. Backend එකෙන් Email එක දැනටමත් තියෙනවද බලනවා (Duplicate Check)
    try {
      const res = await API.get(`/students/profile/${email}`);
      if (res.data) {
        alert("This email is already registered. Please login.");
        return false;
      }
    } catch (err) {
      // 404 error එකක් ආවොත් කියන්නේ email එක database එකේ නැහැ කියන එක.
      // ඒ නිසා එතකොට අපිට register වෙන්න පුළුවන්.
      if (err.response && err.response.status !== 404) {
        console.error("Error checking email:", err);
      }
    }

    return true;
  };

  const register = async () => {
    // Register වීමට පෙර validation run කිරීම
    const isValid = await validateForm();
    if (!isValid) return;

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
          <input 
            name="mobile" 
            value={form.mobile} 
            onChange={handleChange} 
            placeholder="07XXXXXXXX" 
            maxLength={10} // ඉලක්කම් 10 ට වඩා ගහන්න බැරි වෙන්න
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} />
        </div>

        <button className="register-btn" onClick={register}>Register</button>

        <div className="form-footer">
          <span onClick={() => navigate("/fogot-pw")} style={{cursor: "pointer"}}>Forgot Password?</span>
          <span onClick={() => navigate("/login")} style={{cursor: "pointer"}}>Already have an account?</span>
        </div>
      </div>
    </div>
  );
}