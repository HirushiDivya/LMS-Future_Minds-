import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API";
import "../Admin/css/AllStudents.css";

export default function AllStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Search term එක සඳහා
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteStudentId, setDeleteStudentId] = useState(null); // Delete modal එක සඳහා

  const navigate = useNavigate();

  // SearchTerm එක වෙනස් වන හැම වෙලාවකම Fetch වෙන්න
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 300); // User ටයිප් කරලා නතර කරනකම් තත්පර 0.3ක් ඉන්නවා (Performance වලට හොදයි)

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchStudents = () => {
    let url = "/students";

    // නමක් ටයිප් කරලා තියෙනවා නම් Search API එක පාවිච්චි කරන්න
    if (searchTerm.trim() !== "") {
      url = `/students/${searchTerm}`;
    }

    API.get(url)
      .then((res) => {
        setStudents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        // 404 ආවොත් (Students නැති උනොත්) list එක හිස් කරන්න
        if (err.response && err.response.status === 404) {
          setStudents([]);
        }
        console.error(err);
        setLoading(false);
      });
  };

  // --- අනෙකුත් Handle Functions (handleView, handleDelete, handleUpdate ආදිය පරණ විදිහටම තියන්න) ---
  const handleView = (id) => {
    API.get(`/admin/student/${id}`)
      .then((res) => setSelectedStudent(res.data))
      .catch((err) => console.error(err));
  };

  const confirmDelete = () => {
    API.delete(`/admin/student/${deleteStudentId}`)
      .then((res) => {
        setDeleteStudentId(null);
        fetchStudents();
      })
      .catch((err) => console.error(err));
  };

  const handleEditClick = (student) => setEditStudent(student);

  const handleEditChange = (e) => {
    setEditStudent({ ...editStudent, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    API.put(`/admin/student/${editStudent.id}`, editStudent)
      .then(() => {
        setEditStudent(null);
        fetchStudents();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="students-container">
      <h2>All Students</h2>

      {/* ==============================
          Search Bar Section
      ============================== */}
      <div className="search-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search by student name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p className="empty-state">No students found.</p>
      ) : (
        <div className="table-responsive">
          <table className="students-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Mobile Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <strong>{student.full_name}</strong>
                  </td>
                  <td>{student.email}</td>
                  <td>{student.mobile}</td>
                  <td style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                      className="view-btn"
                      onClick={() => handleView(student.id)}
                    >
                      View
                    </button>
                    <button
                      className="view-btn"
                      onClick={() => handleEditClick(student)}
                    >
                      Edit
                    </button>
                    <button
                      className="view-btn"
                      onClick={() => setDeleteStudentId(student.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/sprogress/${student.id}`)}
                    >
                      Progress
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View & Edit Modals (පරණ Code එකම පාවිච්චි කරන්න) */}
      {selectedStudent && (
        <div className="modal">
          <div className="modal-content glass-effect">
            <h3>Student Details</h3>
            <p>
              <strong>Name:</strong> {selectedStudent.full_name}
            </p>
            <p>
              <strong>Email:</strong> {selectedStudent.email}
            </p>
            <p>
              <strong>Mobile:</strong> {selectedStudent.mobile}
            </p>
            <button
              className="save-btn"
              onClick={() => setSelectedStudent(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {editStudent && (
        <div className="modal">
          <div className="modal-content glass-effect">
            <h3>Edit Student</h3>
            <input
              type="text"
              name="full_name"
              value={editStudent.full_name}
              onChange={handleEditChange}
            />
            <input
              type="email"
              name="email"
              value={editStudent.email}
              onChange={handleEditChange}
            />
            <input
              type="text"
              name="mobile"
              value={editStudent.mobile}
              onChange={handleEditChange}
            />
            <label style={{ color: "white" }}>Reset Password :</label>
            <input
              type="password"
              name="password"
              //className="search-input"
              placeholder="Enter new password to reset"
              onChange={handleEditChange}
            />
            <label
              style={{
                color: "white",
                display: "block",
                textAlign: "left",
                marginTop: "10px",
              }}
            >
              Account Status:
            </label>
            <select
              name="status"
              className="search-input" // ඔබේ පවතින CSS පන්තියම භාවිතා කළ හැකියි
              style={{ width: "100%", marginBottom: "15px" }}
              value={editStudent.status}
              onChange={handleEditChange}
            >
              <option value="Active">Active</option>
              <option value="Deactive">Deactive</option>
            </select>
            <div className="modal-buttons">
              <button onClick={handleUpdate} className="save-btn">
                Save
              </button>
              <button
                onClick={() => setEditStudent(null)}
                className="cancel-link"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteStudentId && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            className="glass-effect"
            style={{
              padding: "35px",
              borderRadius: "25px",
              width: "400px",
              textAlign: "center",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                color: "#ffeb3b",
                marginBottom: "15px",
                fontSize: "1.8rem",
              }}
            >
              Are you sure?
            </h3>
            <p
              style={{ color: "#fff", marginBottom: "25px", lineHeight: "1.5" }}
            >
              This action cannot be undone. <br /> Do you really want to delete
              this student?
            </p>

            {/* Buttons Container - බොත්තම් පේළියට ගැනීමට */}
            <div
              style={{ display: "flex", gap: "15px", justifyContent: "center" }}
            >
              {/* Yes Delete Button */}
              <button
                onClick={confirmDelete}
                style={{
                  backgroundColor: "#ff4b2b",
                  backgroundImage: "linear-gradient(45deg, #ff4b2b, #ff416c)",
                  color: "white",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  flex: 1,
                  fontSize: "1rem",
                  transition: "0.3s",
                }}
                onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
              >
                Yes, Delete
              </button>

              {/* Go Back Button */}
              
            </div>
          </div>
        </div>
      )}
       <button
        className="view-btn"
        onClick={() => navigate('/a-dashbord')}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: "1000",
          padding: "12px 30px",
          borderRadius: "30px",
          background: "rgba(255, 255, 255, 0.2)", // Glass effect එකට ගැලපෙන ලෙස
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          fontSize: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => (e.target.style.background = "#00d2ff")} // Hover කරන විට පාට වෙනස් වීමට
        onMouseOut={(e) =>
          (e.target.style.background = "rgba(255, 255, 255, 0.2)")
        }
      >
        ← BACK TO DASHBORD
      </button>
    </div>
  );
}
