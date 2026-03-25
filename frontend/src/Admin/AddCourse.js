import { useState } from "react";
import API from "../API";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // 1.SweetAlert import 
import "../Admin/css/Coursecontent.css";

export default function AddCourse() {
  const [formData, setFormData] = useState({
    title: "",
    descriptions: "",
    price: "",
    category: "Science",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await API.post("/courses/add", formData);
      
      if (response.status === 200) {
        //2. Advance Alert
        Swal.fire({
          title: "Success!",
          text: "Course Added Successfully!",
          icon: "success",
          confirmButtonColor: "#00d2ff",
          background: "#1e1e2f", 
          color: "#fff"
        }).then(() => {
          navigate("/a-courses"); 
        });
      }
    } catch (err) {
      console.error("Error adding course:", err);
      // Error alert 
      Swal.fire({
        title: "Error!",
        text: "Failed to add course. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="form-container glass-effect" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#fff", marginBottom: "30px" }}>Add New Course</h2>
        
        <form onSubmit={handleSubmit} className="course-form">
          <div>
            <label>Course Title</label>
            <input
              type="text"
              name="title"
              placeholder="Enter course title"
              required
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Description</label>
            <textarea
              name="descriptions"
              placeholder="Enter course description"
              required
              rows="4"
              value={formData.descriptions}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label>Price (LKR)</label>
              <input
                type="number"
                name="price"
                placeholder="5000"
                required
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
            <button type="submit" disabled={loading} className="submit-btn" style={{ flex: 2 }}>
              {loading ? "Adding..." : "ADD COURSE"}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="cancel-btn" style={{ flex: 1 }}>
              CANCEL
            </button>
          </div>
        </form>
      </div>

      <button
        className="view-btn"
        onClick={() => navigate(-1)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: "1000",
          padding: "12px 30px",
          borderRadius: "30px",
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          fontSize: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => (e.target.style.background = "#00d2ff")}
        onMouseOut={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.2)")}
      >
        ← BACK TO LIST
      </button>
    </div>
  );
}