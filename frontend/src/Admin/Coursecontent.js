import React, { useState, useEffect } from "react";
import API from "../API";
import { useParams, useNavigate } from "react-router-dom";
//import "../Admin/css/Coursecontent.css";
import Swal from "sweetalert2";
 import "./cours.css";

export default function CourseContent() {
  const { course_code } = useParams();
  const [contents, setContents] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState(null);

  // Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editContent, setEditContent] = useState(null);
  const [formData, setFormData] = useState({
    course_code: course_code,
    content_type: "Video",
    title: "",
    external_link: "",
  });

  useEffect(() => {
    if (course_code) {
      fetchCourseName();
      fetchContent();
    }
  }, [course_code]);

  const fetchCourseName = () => {
    API.get(`/courses/${course_code}`)
      .then((res) => {
        setCourseTitle(res.data.title || res.data.course_name || "");
      })
      .catch((err) => console.error("Error fetching title:", err));
  };

  const fetchContent = () => {
    setLoading(true);
    API.get(`/content/course/${course_code}`)
      .then((res) => {
        setContents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setContents([]);
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("content_type", formData.content_type);
    data.append("title", formData.title);
    data.append("external_link", formData.external_link);

    if (selectedFile) {
      data.append("file", selectedFile);
    }

    API.post(`/content/add/${course_code}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((res) => {
        setShowAddModal(false);
        setSelectedFile(null);
        setFormData({ ...formData, title: "", external_link: "" });
        fetchContent();
        alert("Content Uploaded Successfully!");
      })
      .catch((err) => {
        console.error(err);
        alert("Error uploading content");
      });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    API.put(`/content/update/${editContent.id}`, editContent)
      .then(() => {
        setEditContent(null);
        fetchContent();
      })
      .catch((err) => alert("Error updating content"));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this content? This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff4d4d",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      background: "#1a1a1a",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        API.delete(`/content/delete/${id}`)
          .then(() => {
            Swal.fire({
              title: "Deleted!",
              text: "Content has been deleted.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
              background: "#1a1a1a",
              color: "#fff",
            });
            fetchContent();
          })
          .catch((err) => {
            Swal.fire({
              title: "Error!",
              text: "Something went wrong while deleting.",
              icon: "error",
              background: "#1a1a1a",
              color: "#fff",
            });
          });
      }
    });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div className="admin-main-content">
      <div className="dashboard-title-text" style={{ marginTop: "40px", paddingBottom: "30px" }}>
        
        
          <h2>
            {courseTitle ? `${courseTitle} - ${course_code}` : course_code}
          </h2>
      
      </div>

      <div className="courses-grid">
        <div
          className="coursepge-card"
          onClick={() => setShowAddModal(true)}
          style={{
            border: "2px dashed rgba(255, 255, 255, 0.3)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "150px",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.borderColor = "var(--accent-color)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)")
          }
        >
          <span
            style={{
              fontSize: "4rem",
              color: "var(--accent-color)",
              fontWeight: "300",
            }}
          >
            +
          </span>
          <h3 style={{ color: "var(--text-bold)", marginTop: "10px" }}>
            Add New Content
          </h3>
        </div>

        {!loading &&
          contents.map((item) => (
            <div key={item.id} className="coursepge-card" style={{ border: "1px solid #696464" }}>
              <div className="course-badge" style={{background: "#53789d", marginTop:"-15px"}}>{item.content_type}</div>
              <h3>{item.title}</h3>
              {item.external_link && (
                <a
                  href={item.external_link}
                  target="_blank"
                  rel="noreferrer"
                  className="link-preview"
                >
                  View Resource
                </a>
              )}
              <div className="card-actions" style={{marginLeft: "90px"}}>
                <button
                  className="course-view-btn"
                  onClick={() => setEditContent(item)}
                >
                  Edit
                </button>
                <button
                  className="course-view-btn"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      {showAddModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1001,
          }}
        >
          <div
            className="modal-content glass-effect"
            style={{ width: "400px", padding: "30px", borderRadius: "20px" }}
          >
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
              Add New Content
            </h3>
            <form
              onSubmit={handleAddSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {/* Content Type Select */}
              <select
                name="content_type"
                className="search-input"
                onChange={handleInputChange}
                value={formData.content_type}
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  display: "block",
                }}
              >
                <option value="Video">Video</option>
                <option value="PDF">PDF Document</option>
                <option value="Link">External Link</option>
              </select>

              {/* Title Input */}
              <input
                type="text"
                name="title"
                className="search-input"
                placeholder="Enter Content Title (e.g. Lesson 01)"
                required
                value={formData.title}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  display: "block",
                }}
              />

              {/* File Upload Input*/}
              {(formData.content_type === "Video" ||
                formData.content_type === "PDF") && (
                <div
                  className="file-input-container"
                  style={{ marginTop: "10px" }}
                >
                  <label
                    style={{
                      color: "#fff",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    Choose File:
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept={
                      formData.content_type === "Video"
                        ? "video/*"
                        : "application/pdf"
                    }
                    style={{ color: "#fff" }}
                  />
                </div>
              )}

              <input
                type="text"
                name="external_link"
                className="search-input"
                placeholder="Or paste External Link (URL) here"
                value={formData.external_link}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  display: "block",
                }}
              />

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="submit" className="save-btn">
                  UPLOAD CONTENT
                </button>
                <button
                  type="button"
                  className="save-btn delete-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editContent && (
        <div className="modal-overlay">
          <div className="modal-content glass-effect">
            <h3>Edit Content</h3>
            <form onSubmit={handleUpdateSubmit}>
              <select
                className="search-input"
                style={{ width: "100%" }}
                name="content_type"
                value={editContent.content_type}
                onChange={(e) =>
                  setEditContent({
                    ...editContent,
                    content_type: e.target.value,
                  })
                }
              >
                <option value="Video">Video</option>
                <option value="PDF">PDF Document</option>
                <option value="Link">External Link</option>
                <option value="Assignment">Assignment</option>
              </select>
              <input
                className="search-input"
                style={{ width: "100%" }}
                type="text"
                name="title"
                value={editContent.title}
                onChange={(e) =>
                  setEditContent({ ...editContent, title: e.target.value })
                }
              />
              <input
                className="search-input"
                style={{ width: "100%" }}
                type="text"
                name="external_link"
                value={editContent.external_link}
                onChange={(e) =>
                  setEditContent({
                    ...editContent,
                    external_link: e.target.value,
                  })
                }
              />
              <div className="modal-btns">
                <button type="submit" className="save-btn">
                  Update
                </button>
                <button
                  type="button"
                  className="save-btn delete-btn"
                  onClick={() => setEditContent(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
