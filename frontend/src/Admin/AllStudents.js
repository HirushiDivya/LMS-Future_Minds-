import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API";
import "../Admin/css/AllStudents.css";

export default function AllStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteStudentId, setDeleteStudentId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchStudents = () => {
    let url = "/students";
    if (searchTerm.trim() !== "") {
      url = `/students/${searchTerm}`;
    }

    API.get(url)
      .then((res) => {
        setStudents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setStudents([]);
        }
        console.error(err);
        setLoading(false);
      });
  };

  const handleView = (id) => {
    API.get(`/admin/student/${id}`)
      .then((res) => setSelectedStudent(res.data))
      .catch((err) => console.error(err));
  };

  const confirmDelete = () => {
    API.delete(`/admin/student/${deleteStudentId}`)
      .then(() => {
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
    <div className="admin-dashboard-wrapper">
      <main className="admin-main-content">
        <header className="dashboard-header-flex">
          
          <h1 className="allstudent-title-text" >All Students</h1>
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="card-panel">
          {loading ? (
            <div className="loading-text">Loading students...</div>
          ) : students.length === 0 ? (
            <p className="empty-state">No students found.</p>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
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
                    <tr key={student.id} className="table-row-hover">
                      <td className="sname">
                        <span className="student-name">{student.full_name}</span>
                      </td>
                      <td>{student.email}</td>
                      <td>{student.mobile}</td>
                      <td>
                        <div className="action-button-group">
                          <button className="review-btn btn-view" onClick={() => handleView(student.id)}>View</button>
                          <button className="review-btn btn-edit" onClick={() => handleEditClick(student)}>Edit</button>
                          <button className="review-btn btn-delete" onClick={() => setDeleteStudentId(student.id)}>Delete</button>
                          <button className="review-btn btn-progress" onClick={() => navigate(`/sprogress/${student.id}`)}>Progress</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Modal */}
        {selectedStudent && (
          <div className="modal-overlay">
            <div className="modal-content glass-effect">
              <h3 className="modal-title">Student Details</h3>
              <div className="detail-row"><strong>Name:</strong> {selectedStudent.full_name}</div>
              <div className="detail-row"><strong>Email:</strong> {selectedStudent.email}</div>
              <div className="detail-row"><strong>Mobile:</strong> {selectedStudent.mobile}</div>
              <button className="view-req-btn" onClick={() => setSelectedStudent(null)}>Close</button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editStudent && (
          <div className="modal-overlay">
            <div className="modal-content glass-effect">
              <h3 className="modal-title">Edit Student</h3>
              <div className="input-group">
                <label style={{marginTop:"-40px"}}>Full Name</label>
                <input type="text" name="full_name" className="modal-input" value={editStudent.full_name} onChange={handleEditChange} />
              </div>
              <div className="input-group">
                <label style={{marginTop:"-40px"}}>Email</label>
                <input type="email" name="email" className="modal-input" value={editStudent.email} onChange={handleEditChange} />
              </div>
              <div className="input-group">
                <label style={{marginTop:"-40px"}}>Mobile</label>
                <input type="text" name="mobile" className="modal-input" value={editStudent.mobile} onChange={handleEditChange} />
              </div>
              <div className="input-group">
                <label style={{marginTop:"-40px"}}>Reset Password</label>
                <input type="password" name="password" className="modal-input" placeholder="New password" onChange={handleEditChange} />
              </div>
              <div className="input-group">
                <label style={{marginTop:"-40px"}}>Account Status</label>
                <select name="status" className="modal-input" value={editStudent.status} onChange={handleEditChange}>
                  <option value="Active">Active</option>
                  <option value="Deactive">Deactive</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button onClick={handleUpdate} className="view-req-btn">Save Changes</button>
                <button onClick={() => setEditStudent(null)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteStudentId && (
          <div className="modal-overlay">
            <div className="modal-content glass-effect delete-modal">
              <h3 className="delete-title">Are you sure?</h3>
              <p className="delete-desc">This action cannot be undone. Do you really want to delete this student?</p>
              <div className="modal-buttons">
                <button onClick={confirmDelete} className="confirm-delete-btn">Yes, Delete</button>
                <button onClick={() => setDeleteStudentId(null)} className="cancel-btn">No, Keep it</button>
              </div>
            </div>
          </div>
        )}
 
        <button className="floating-back-btn" onClick={() => navigate("/a-dashbord")}>
          ← BACK TO DASHBOARD
        </button>
      </main>
    </div>
  );
}
