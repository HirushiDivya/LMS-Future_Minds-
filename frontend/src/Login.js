import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./API";
import "./Login.css";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async () => {
  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    setLoading(true);
    const res = await API.post("/login/login", { email, password });

    // Backend check (Console)
    console.log("Login Response:", res.data);

    if (res.data.name) {
      // local storage sve
      localStorage.setItem("userName", res.data.name);
      localStorage.setItem("userRole", res.data.role);
      localStorage.setItem("userID", res.data.userID);
      localStorage.setItem("isLoggedIn", "true");
      
      alert(res.data.message);
      
     //navigate base on role
      if (res.data.role === "admin") {
        navigate("/a-dashbord");
      } else {
        navigate("/home");
      }      
      window.location.reload(); 
    } else {
      alert("Error: Name not received from server");
    }

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Login failed. Please check your credentials.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome Back 👋</h2>
        <p className="subtitle">Sign in to continue learning</p>

        <div className="input-group">
          <input
            type="email"
            required
            autoComplete="off"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Email Address</label>
        </div>

        <div className="input-group">
          <input
            type="password"
            required
            autoComplete="off"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Password</label>
        </div>

        <button className="login-btn" onClick={login} disabled={loading}>
          {loading ? <span className="loader"></span> : "Login"}
        </button>

        <div className="login-links">
          <span onClick={() => navigate("/fogot-pw")}>Forgot Password?</span>
          <span onClick={() => navigate("/student-reg")}>Create Account</span>
        </div>
      </div>
    </div>
  );
}
