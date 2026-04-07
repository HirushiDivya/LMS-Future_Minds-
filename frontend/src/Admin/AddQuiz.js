import React, { useState } from "react";
import API from "../API";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
//import "../Admin/css/Coursecontent.css";
//import "./Admin.css";
import "./cours.css";

const AddQuiz = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
 
  const [quizData, setQuizData] = useState({
    title: "",
    qdescription: "",
    time_limit_minutes: "",
    price: "",
    course_id: "",
  });

  const [csvFile, setCsvFile] = useState(null); // CSV (Questions) සඳහා
  const [imageFile, setImageFile] = useState(null); // Image File එක සඳහා
  const [imageUrl, setImageUrl] = useState(""); // Image URL එක සඳහා

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prev) => ({ ...prev, [name]: value }));
  };

  // Drag & Drop Logic
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Course ID එක පරීක්ෂා කිරීම
      try {
        await API.get(`/courses/${quizData.course_id}`);
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Invalid Course Code!', background: '#111', color: '#fff' });
        setLoading(false);
        return;
      }

      // 2. FormData සකස් කිරීම (Quiz දත්ත සහ Image සඳහා)
      const formData = new FormData();
      formData.append("title", quizData.title);
      formData.append("qdescription", quizData.qdescription);
      formData.append("time_limit_minutes", quizData.time_limit_minutes);
      formData.append("price", quizData.price);
      formData.append("course_id", quizData.course_id);
      
      if (imageFile) {
        formData.append("Quiz_IMG", imageFile); // File එකක් තිබේ නම්
      } else {
        formData.append("image_url", imageUrl); // නැතිනම් Link එක
      }

      // 3. Quiz එක Create කිරීම
      const quizRes = await API.post("/quiz/create-quiz", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const quizId = quizRes.data.quizId;

      // 4. CSV File (Questions) Upload කිරීම
      if (quizId && csvFile) {
        const csvFormData = new FormData();
        csvFormData.append("file", csvFile);

        await API.post(`/quiz/upload-questions/${quizId}`, csvFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Quiz & Questions Uploaded Successfully!',
          background: '#111',
          color: '#fff'
        }).then(() => navigate("/a-quiz"));
      }

    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error Creating Quiz', background: '#111', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-main-content">
      <div className="dashboard-title-text">
        <h2>Create New Quiz</h2>
      </div>

      <div className="glass-effect" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <form onSubmit={handleSubmit} className="course-form">

          {/* Quiz Details (Title, Description, etc.) */}
          <div className="form-group">
            <label>Quiz Title</label>
            <input type="text" name="title" required value={quizData.title} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="qdescription" rows="3" value={quizData.qdescription} onChange={handleInputChange}></textarea>
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
             <div style={{ flex: 1 }}>
                <label>Time Limit (Min)</label>
                <input type="number" name="time_limit_minutes" required value={quizData.time_limit_minutes} onChange={handleInputChange} />
             </div>
             <div style={{ flex: 1 }}>
                <label>Price (Rs.)</label>
                <input type="number" name="price" required value={quizData.price} onChange={handleInputChange} />
             </div>
          </div>

          <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
            <div style={{ flex: 1 }}>
              <label>Course ID</label>
              <input type="text" name="course_id" required value={quizData.course_id} onChange={handleInputChange} />
            </div>
            
          </div>

          <hr style={{ borderColor: "rgba(198, 118, 118, 0.1)", margin: "20px 0" }} />

          {/* --- QUIZ IMAGE SECTION --- */}
          <div className="form-group">
            <label className="quizthumbnail">Quiz Thumbnail (Image Link OR Upload)</label>
            <input 
              type="text" 
              placeholder="Paste Image URL here..." 
              value={imageUrl} 
              onChange={(e) => { setImageUrl(e.target.value); setImageFile(null); }} 
              style={{ marginBottom: "10px" }}
            />
            
            <div 
              className={`drag-drop-zone ${dragActive ? "active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('imageInput').click()}
              style={{
                border: "2px dashed #555",
                padding: "20px",
                textAlign: "center",
                borderRadius: "10px",
                cursor: "pointer",
                background: dragActive ? "rgba(0, 210, 255, 0.1)" : "transparent"
              }}
            >
              {imageFile ? (
                <p style={{ color: "#3c3d3d" }}>Selected: {imageFile.name}</p>
              ) : (
                <p style={{color: "#666464"}}>Drag & Drop Quiz Image here or <b>Click to browse</b></p>
              )}
              <input 
                id="imageInput"
                type="file" 
                accept="image/*" 
                hidden 
                onChange={(e) => setImageFile(e.target.files[0])} 
              />
            </div>
          </div>

          {/* --- QUESTIONS CSV SECTION --- */}
          <div className="file-upload-section" style={{ marginTop: "20px", border: "1px dashed #555", padding: "15px", borderRadius: "8px" }}>
            <label className= "uploadcsv" >Upload Questions (CSV File)</label>
            <input type="file" className="csv-input" accept=".csv" required onChange={(e) => setCsvFile(e.target.files[0])} style={{ color: "white", marginTop: "10px" }} />
          </div>

          <button type="submit" className="review-btn" >
            CREATE QUIZ & UPLOAD CSV
          </button>
        </form>
      </div>

      <button className="floating-back-btn" onClick={() => navigate("/a-dashbord")}>
        ← BACK TO DASHBOARD
      </button>
    </div>
  );
};

export default AddQuiz;