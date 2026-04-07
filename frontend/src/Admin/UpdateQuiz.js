import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Trash2, ArrowLeft, Info, HelpCircle } from "lucide-react";
import Swal from "sweetalert2";

const AUpdateQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // States
  const [quizData, setQuizData] = useState(null);
  const [editQuiz, setEditQuiz] = useState(null);
  const [editQuestion, setEditQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchFullQuiz = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/quiz/quiz/${id}`);
      setQuizData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching quiz data", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullQuiz();
  }, [id]);

  // Title, Price etc.Update
  const handleUpdateQuiz = async (e) => {
  e.preventDefault();
  
  try {
    // Backend request
    await axios.put(`http://localhost:5000/api/quiz/update-quiz/${id}`, {
      title: editQuiz.title,
      qdescription: editQuiz.qdescription,
      time_limit_minutes: editQuiz.time_limit_minutes,
      price: editQuiz.price,
      course_id: editQuiz.course_id,
    });

    // Success SweetAlert
    Swal.fire({
      title: 'Success!',
      text: 'Quiz Updated Successfully!',
      icon: 'success',
      confirmButtonColor: '#3085d6',
      timer: 2000 // after 2 sec off auto
    });

    setEditQuiz(null);
    fetchFullQuiz();

  } catch (err) {
    console.error("Update error:", err);

    // Error SweetAlert
    Swal.fire({
      title: 'Error!',
      text: 'Update failed. Please try again.',
      icon: 'error',
      confirmButtonColor: '#d33',
    });
  }
};
// Question Update
const handleUpdateQuestion = async (e) => {
  e.preventDefault();
  try {
    await axios.put(
      `http://localhost:5000/api/quiz/update-question/${editQuestion.id}`,
      editQuestion,
    );

    // Success Alert
    Swal.fire({
      icon: 'success',
      title: 'Updated!',
      text: 'The question has been updated successfully.',
      timer: 2000,
      showConfirmButton: false
    });

    setEditQuestion(null);
    fetchFullQuiz();
  } catch (err) {
    console.error(err);

    // Error Alert
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: 'Something went wrong while updating the question.',
      confirmButtonColor: '#d33',
    });
  }
};

// Question Delete
const handleDeleteQuestion = async (questionId) => {
  // Confirmation Dialog
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then(async (result) => {
    // If user clicks "Yes, delete it!"
    if (result.isConfirmed) {
      try {
        await axios.delete(
          `http://localhost:5000/api/quiz/delete-question/${questionId}`
        );

        // Success Alert
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The question has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false
        });

        fetchFullQuiz(); // Refresh the list
      } catch (err) {
        console.error(err);
        
        // Error Alert
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to delete the question. Please try again.',
          confirmButtonColor: '#d33',
        });
      }
    }
  });
};

  if (loading)
    return <div className="loading-screen">Loading Quiz Data...</div>;
  if (!quizData) return <div className="loading-screen">Quiz Not Found</div>;

  const handleCsvUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      return Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select a CSV file before clicking upload.",
        confirmButtonColor: "#3085d6",
      });
    }

    const formData = new FormData();
    // Matching the backend requirement: "file"
    formData.append("file", selectedFile);
    formData.append("quizId", id);

    setUploading(true);

    // Loading state alert
    Swal.fire({
      title: "Uploading...",
      text: "Please wait while your questions are being processed.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await axios.post(
        `http://localhost:5000/api/quiz/upload-questions/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      // Success Alert
      Swal.fire({
        icon: "success",
        title: "Upload Successful!",
        text: "The questions have been added to the quiz successfully.",
        timer: 2500,
        showConfirmButton: false,
      });

      setSelectedFile(null);
      fetchFullQuiz();
    } catch (err) {
      console.error(err);

      // Error Alert
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "There was an error processing the CSV file. Please ensure the format is correct.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-main-content">
        {/* Header Section */}
        <div className="dashboard-header-flex">
          <h2 className="dashboard-title-text">
            Manage Quiz: {quizData.title}
          </h2>
        </div>

        {/*  Quiz  Details Table  */}
        <div className="card-panel" style={{ marginBottom: "30px" }}>
          <h3 className="card-title">
            <Info size={18} style={{ marginRight: "10px" }} /> Quiz Main Details
          </h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Time (Min)</th>
                  <th>Course Code</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-row-hover">
                  <td>{quizData.title}</td>
                  <td>{quizData.qdescription}</td>
                  <td>Rs. {quizData.price}</td>
                  <td>{quizData.time_limit_minutes} min</td>
                  <td>{quizData.course_id}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="review-btn"
                      onClick={() => setEditQuiz(quizData)}
                    >
                      UPDATE INFO
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/*  Questions List Table  */}
        <div className="card-panel">
          <h3 className="card-title">
            <HelpCircle size={18} style={{ marginRight: "10px" }} /> Questions
            List
          </h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Question Text</th>
                  <th>Correct Opt</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizData.questions &&
                  quizData.questions.map((q) => (
                    <tr key={q.id} className="table-row-hover">
                      <td>#{q.id}</td>
                      <td style={{ maxWidth: "400px" }}>{q.question_text}</td>
                      <td>
                        <span className="status-badge status-approved">
                          {q.correct_option}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="action-button-group">
                          <button
                            className="review-btn"
                            onClick={() => setEditQuestion(q)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="review-btn"
                            style={{
                              backgroundColor: "#e11d48",
                              color: "white",
                            }}
                            onClick={() => handleDeleteQuestion(q.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/*  Quiz Edit Modal  */}
        {editQuiz && (
          <div className="modal-overlay">
            <div
              className="card-panel modal-content"
              style={{
                maxWidth: "500px",
                background: "#001529",
                padding: "30px",
              }}
            >
              <h3
                className="modal-title"
                style={{
                  color: "#ffcc00",
                  marginBottom: "20px",
                  textTransform: "uppercase",
                }}
              >
                Update Quiz Info
              </h3>
              <form onSubmit={handleUpdateQuiz}>
                <div className="input-groupp" style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      color: "#ffcc00",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    TITLE
                  </label>
                  <input
                    className="modal-input"
                    type="text"
                    value={editQuiz.title}
                    onChange={(e) =>
                      setEditQuiz({ ...editQuiz, title: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div className="input-groupp" style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      color: "#ffcc00",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    DESCRIPTION
                  </label>
                  <textarea
                    className="modal-input"
                    value={editQuiz.qdescription}
                    onChange={(e) =>
                      setEditQuiz({ ...editQuiz, qdescription: e.target.value })
                    }
                    style={{
                      width: "100%",
                      height: "80px",
                      padding: "10px",
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      resize: "none",
                    }}
                  />
                </div>

                <div
                  style={{ display: "flex", gap: "15px", marginBottom: "15px" }}
                >
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        color: "#ffcc00",
                        display: "block",
                        marginBottom: "5px",
                      }}
                    >
                      PRICE (LKR)
                    </label>
                    <input
                      className="modal-input"
                      type="number"
                      value={editQuiz.price}
                      onChange={(e) =>
                        setEditQuiz({ ...editQuiz, price: e.target.value })
                      }
                      style={{ width: "100%", padding: "10px" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        color: "#ffcc00",
                        display: "block",
                        marginBottom: "5px",
                      }}
                    >
                      TIME (MIN)
                    </label>
                    <input
                      className="modal-input"
                      type="number"
                      value={editQuiz.time_limit_minutes}
                      onChange={(e) =>
                        setEditQuiz({
                          ...editQuiz,
                          time_limit_minutes: e.target.value,
                        })
                      }
                      style={{ width: "100%", padding: "10px" }}
                    />
                  </div>
                </div>

                <div className="input-groupp" style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      color: "#ffcc00",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    COURSE CODE
                  </label>
                  <input
                    className="modal-input"
                    type="text"
                    value={editQuiz.course_id}
                    onChange={(e) =>
                      setEditQuiz({ ...editQuiz, course_id: e.target.value })
                    }
                    style={{ width: "100%", padding: "10px" }}
                  />
                </div>

                <div
                  className="modal-buttons"
                  style={{ display: "flex", gap: "10px" }}
                >
                  <button
                    type="submit"
                    className="review-btn"
                    style={{
                      flex: 1,
                      background: "#ffcc00",
                      color: "#001529",
                      fontWeight: "bold",
                    }}
                  >
                    SAVE CHANGES
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setEditQuiz(null)}
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.1)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/*  Question Edit Modal  */}
        {editQuestion && (
          <div className="modal-overlay">
            <div
              className="card-panel modal-content"
              style={{ maxWidth: "700px" }}
            >
              <h3 className="modal-title">Update Question & Explanations</h3>
              <form onSubmit={handleUpdateQuestion}>
                <div className="input-group">
                  <label></label>
                  <textarea
                    className="modal-input"
                    style={{ height: "80px" }}
                    value={editQuestion.question_text}
                    onChange={(e) =>
                      setEditQuestion({
                        ...editQuestion,
                        question_text: e.target.value,
                      })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                    marginBottom: "15px",
                  }}
                >
                  {["a", "b", "c", "d"].map((opt) => (
                    <div
                      key={opt}
                      className="card-panel"
                      style={{
                        padding: "10px",
                        background: "rgba(255,255,255,0.05)",
                      }}
                    >
                      <label
                        style={{
                          color: "#ffcc00",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                        }}
                      >
                        Option {opt.toUpperCase()}:
                      </label>
                      <input
                        className="modal-input"
                        value={editQuestion[`option_${opt}`]}
                        onChange={(e) =>
                          setEditQuestion({
                            ...editQuestion,
                            [`option_${opt}`]: e.target.value,
                          })
                        }
                      />
                      <label style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                        Explanation:
                      </label>
                      <input
                        className="modal-input"
                        style={{ fontSize: "0.8rem" }}
                        value={editQuestion[`explanation_${opt}`] || ""}
                        onChange={(e) =>
                          setEditQuestion({
                            ...editQuestion,
                            [`explanation_${opt}`]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>

                <select
                  className="modal-input"
                  style={{
                    color: "black",
                    backgroundColor: "white",
                    marginBottom: "20px",
                  }}
                  value={editQuestion.correct_option}
                  onChange={(e) =>
                    setEditQuestion({
                      ...editQuestion,
                      correct_option: e.target.value,
                    })
                  }
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>

                <div
                  className="modal-buttons"
                  style={{ display: "flex", gap: "10px" }}
                >
                  <button
                    type="submit"
                    className="review-btn"
                    style={{ flex: 1 }}
                  >
                    UPDATE QUESTION
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setEditQuestion(null)}
                    style={{ flex: 1 }}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Bulk Upload Section */}
        <div
          className="card-panel"
          style={{ marginTop: "30px", border: "1px dashed #ffcc00" }}
        >
          <h3 className="card-title" style={{ color: "#ffcc00" }}>
            <Edit size={18} style={{ marginRight: "10px" }} /> Bulk Add
            Questions (CSV)
          </h3>
          <div style={{ padding: "15px" }}>
            <p
              style={{
                fontSize: "0.85rem",
                marginBottom: "15px",
                opacity: 0.8,
                color: "#9f9c9c",
              }}
            >
              Upload a CSV file with headers:{" "}
              <b style={{ color: "#9f9c9c" }}>
                {" "}
                Format : question_text, option_a, explanation_a, option_b,
                explanation_b, option_c, explanation_c, option_d, explanation_d,
                correct_option
              </b>
            </p>
            <form
              onSubmit={handleCsvUpload}
              style={{ display: "flex", gap: "15px", alignItems: "center" }}
            >
              <input
                type="file"
                accept=".csv"
                className="csv-input"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ color: "white" }}
              />
              <button
                type="submit"
                className="review-btn"
                disabled={uploading}
                style={{
                  background: "#ffcc00",
                  color: "#001529",
                  fontWeight: "bold",
                }}
              >
                {uploading ? "UPLOADING..." : "UPLOAD CSV"}
              </button>
            </form>
          </div>
        </div>

        <button className="floating-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} style={{ marginRight: "10px" }} /> BACK TO LIST
        </button>
      </div>
    </div>
  );
};

export default AUpdateQuiz;
