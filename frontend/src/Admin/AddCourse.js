import { useState } from "react";
import API from "../API";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../Admin/css/Coursecontent.css";

export default function AddCourse() {
  const [formData, setFormData] = useState({
    title: "",
    descriptions: "",
    price: "",
    category: "Science",
  });

  // Image file + preview  states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // State for image link 
  const [imageUrl, setImageUrl] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // when select new file/link
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImageUrl(""); // remove exist file/image
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // when enter url
  const handleLinkChange = (e) => {
    const link = e.target.value;
    setImageUrl(link);
    setSelectedFile(null); // remove exist link
    setPreviewUrl(link); // Preview -> direct link 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("descriptions", formData.descriptions);
    data.append("price", formData.price);
    data.append("category", formData.category);
    const defaultImage =
      "https://cdn.pixabay.com/photo/2022/11/19/14/42/e-learning-7602249_1280.jpg";

    if (selectedFile) {
      // if select new image(file) send it
      data.append("course_img", selectedFile);
    } else if (imageUrl && imageUrl.trim() !== "") {
      // if select new image(link) send it
      data.append("image_url", imageUrl);
    } else {
      // if not select new image keep exist one
      data.append("image_url", defaultImage);
    }

    try {
      const response = await API.post("/courses/add", data);
      // API -> POST request 

      if (response.status === 200) {
        Swal.fire({
          title: "Success!",
          text: "Course Added Successfully!",
          icon: "success",
          confirmButtonColor: "#00d2ff",
          background: "#1e1e2f",
          color: "#fff",
        }).then(() => {
          navigate("/a-courses");
        });
      }
    } catch (err) {
      console.error("Error adding course:", err);
      // Error 
      Swal.fire({
        title: "Error!",
        text: "Failed to add course. Please check your connection or backend.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-main-content">
      <div
        className="form-container glass-effect"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <h2 className="dashboard-title-text"
        >
          Add New Course
        </h2>

        <form
          onSubmit={handleSubmit}
          className="course-form"
          encType="multipart/form-data"
        >
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

          <div style={{ marginBottom: "15px" }}>
            <label>Course Image (Upload or Paste Link)</label>

            {/* Link එක ඇතුළත් කරන Input එක */}
            <input
              type="text"
              placeholder="Paste Image URL here..."
              value={imageUrl}
              onChange={handleLinkChange}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.3)",
                color: "white",
              }}
            />

            <div
              style={{ textAlign: "center", margin: "5px 0", color: "#aaa" }}
            >
              - OR -
            </div>

            {/* File Upload */}
            <div
              className="image-upload-box"
              style={{
                border: "2px dashed rgba(95, 94, 94, 0.3)",
                padding: "20px",
                textAlign: "center",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.05)",
                cursor: "pointer",
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="imgInput"
                hidden
              />
              <label
                htmlFor="imgInput"
                style={{ cursor: "pointer", color: "#00d2ff" }}
              >
                {selectedFile
                  ? `✅ ${selectedFile.name}`
                  : "Click to Upload Image"}
              </label>

              {/* Preview  */}
              {previewUrl && (
                <div style={{ marginTop: "15px" }}>
                  <p style={{ fontSize: "12px", color: "#888" }}>
                    Image Preview:
                  </p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      display: "block",
                      margin: "5px auto 0",
                      maxWidth: "150px",
                      borderRadius: "8px",
                      border: "1px solid #00d2ff",
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/150?text=Invalid+Link";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
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
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px", marginTop: "25px" }}>
            <button
              type="submit"
              disabled={loading}
              className="review-btn"
              style={{ flex: 2 }}
            >
              {loading ? "Adding..." : "ADD COURSE"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="review-btn"
              style={{ flex: 1 }}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>

      <button
        className="floating-back-btn"
        onClick={() => navigate("/a-dashbord")}
      >
        ← BACK TO LIST
      </button>
    </div>
  );
}
