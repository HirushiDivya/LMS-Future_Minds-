import React, { useState, useEffect } from "react";
import API from "../API";
import { useParams } from "react-router-dom";
import "../Admin/css/Coursecontent.css";

export default function CourseContent() {
  const { course_code } = useParams();
  const [contents, setContents] = useState([]);
  const [courseTitle, setCourseTitle] = useState(""); // Title එක සඳහා අලුත් state එකක්
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editContent, setEditContent] = useState(null);
  const [formData, setFormData] = useState({
    course_code: course_code,
    content_type: "Video",
    title: "",
    external_link: ""
  });

  useEffect(() => {
    if (course_code) {
      fetchCourseName(); // Title එක Fetch කරන function එක
      fetchContent();
    }
  }, [course_code]);

  // Course Title එක ලබා ගැනීම සඳහා අලුත් Function එකක්
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
    API.post(`/content/add/${course_code}`, formData) 
      .then(() => {
        setShowAddModal(false);
        setFormData({ ...formData, title: "", external_link: "" });
        fetchContent();
      })
      .catch(err => {
        console.error(err);
        alert("Error adding content");
      });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    API.put(`/content/update/${editContent.id}`, editContent)
      .then(() => {
        setEditContent(null);
        fetchContent();
      })
      .catch(err => alert("Error updating content"));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      API.delete(`/content/delete/${id}`)
        .then(() => fetchContent())
        .catch(err => console.error(err));
    }
  };

  // ... existing imports

  return (
  <div className="content-page-container">
    <div className="content-header">
      <h2>{courseTitle ? `${courseTitle} - ${course_code}` : course_code}</h2>
    </div>

    <div className="content-grid">
      
      {/* --- 1. PLUS (+) MARK CARD ONLY --- */}
      <div 
        className="content-card" 
        onClick={() => setShowAddModal(true)}
        style={{ 
          border: "2px dashed rgba(255, 255, 255, 0.3)", 
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "250px", // අනෙක් cards වල උසට සමාන කිරීමට
          transition: "all 0.3s ease"
        }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--accent-color)"}
        onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)"}
      >
        <span style={{ fontSize: "4rem", color: "var(--accent-color)", fontWeight: "300" }}>+</span>
        <h3 style={{ color: "var(--text-bold)", marginTop: "10px" }}>Add New Content</h3>
      </div>

      {/* --- 2. EXISTING CONTENT CARDS --- */}
      {!loading && contents.map((item) => (
        <div key={item.id} className="content-card">
          <div className="content-type-badge">{item.content_type}</div>
          <h3>{item.title}</h3>
          {item.external_link && (
            <a href={item.external_link} target="_blank" rel="noreferrer" className="link-preview">
              View Resource
            </a>
          )}
          <div className="card-actions">
            <button className="c-edit-btn" onClick={() => setEditContent(item)}>Edit</button>
            <button className="c-delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>

    {/* --- 3. ADD CONTENT MODAL (The Tab) --- */}
    {showAddModal && (
      <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1001 }}>
        <div className="modal-content glass-effect" style={{ width: "400px", padding: "30px", borderRadius: "20px" }}>
          <h3 style={{ marginBottom: "20px", textAlign: "center" }}>Add New Content</h3>
          <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <select 
              name="content_type" 
              className="search-input" 
              style={{ width: "100%" }}
              onChange={handleInputChange} 
              value={formData.content_type}
            >
              <option value="Video">Video</option>
              <option value="PDF">PDF Document</option>
              <option value="Link">External Link</option>
              <option value="Assignment">Assignment</option>
            </select>
            
            <input 
              type="text" 
              name="title" 
              className="search-input" 
              placeholder="Content Title" 
              required 
              style={{ width: "100%" }}
              value={formData.title} 
              onChange={handleInputChange} 
            />
            
            <input 
              type="text" 
              name="external_link" 
              className="search-input" 
              placeholder="Link (URL)" 
              style={{ width: "100%" }}
              value={formData.external_link} 
              onChange={handleInputChange} 
            />
            
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button type="submit" className="save-btn">UPLOAD CONTENT</button>
              <button type="button" className="save-btn delete-btn" onClick={() => setShowAddModal(false)}>CANCEL</button>
            </div>
          </form>
        </div>
      </div>
    )}

      {/* --- Edit Modal --- */}
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
                onChange={(e) => setEditContent({...editContent, content_type: e.target.value})}
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
                onChange={(e) => setEditContent({...editContent, title: e.target.value})} 
              />
              <input 
                className="search-input" 
                style={{ width: "100%" }}
                type="text" 
                name="external_link" 
                value={editContent.external_link} 
                onChange={(e) => setEditContent({...editContent, external_link: e.target.value})} 
              />
              <div className="modal-btns">
                <button type="submit" className="save-btn">Update</button>
                <button type="button" className="save-btn delete-btn" onClick={() => setEditContent(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

}