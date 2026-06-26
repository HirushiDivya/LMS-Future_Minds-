import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./API";
import "./Login.css";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Please enter email and password',
      });
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

        await Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: res.data.message || 'Login successful!',
          timer: 2000,
          showConfirmButton: true
        });

        //navigate base on role
        if (res.data.role === "admin") {
          navigate("/a-dashbord");
        } else {
          navigate("/home");
        }
        window.location.reload();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Data Error',
          text: 'Error: Name not received from server',
        });
      }

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.response?.data?.message || 'Login failed. Please check your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome Back 👋</h2>
        <p className="subtitle">Sign in to continue learning</p>


        {/* --- Email Input --- */}
        <div className="input-group">
          <label className="top-label">Email Address</label>
          <input
            type="email"
            required
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* --- Password Input --- */}
        <div className="input-group">
          <label className="top-label">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
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
