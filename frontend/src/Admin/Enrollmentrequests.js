import React, { useState, useEffect } from "react";
import API from "../API";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../Admin/css/Admindashbord.css";
import { useNavigate } from "react-router-dom";

export default function AdminEnrollmentRequests() {
    const [courseEnrollments, setCourseEnrollments] = useState([]);
    const [quizEnrollments, setQuizEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const BACKEND_URL = "http://localhost:5000";

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [courseRes, quizRes] = await Promise.all([
                API.get("/admin/course/all-enrollments"),
                API.get("/admin/quiz/all-paymntrequests")
            ]);
            setCourseEnrollments(courseRes.data);
            setQuizEnrollments(quizRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setLoading(false);
        }
    };

    //  PDF Generation  

    const generateCoursePDF = () => {
        const doc = new jsPDF();
        doc.setFillColor(0, 35, 71);
        doc.rect(0, 0, 210, 40, "F");
        doc.setTextColor(255, 204, 0);
        doc.setFontSize(20);
        doc.text("COURSE ENROLLMENT REPORT", 105, 25, { align: "center" });

        const tableRows = courseEnrollments.map(item => [
            item.student_name,
            item.course_name,
            `LKR ${item.course_price}`,
            item.payment_method,
            new Date(item.enroll_date).toLocaleDateString(),
            item.payment_status
        ]);

        autoTable(doc, {
            startY: 50,
            head: [["Student", "Course", "Price", "Method", "Date", "Status"]],
            body: tableRows,
            headStyles: { fillColor: [0, 35, 71], textColor: [255, 204, 0] }
        });
        doc.save("Course_Enrollments.pdf");
    };

    const generateQuizPDF = () => {
        const doc = new jsPDF();
        doc.setFillColor(0, 35, 71);
        doc.rect(0, 0, 210, 40, "F");
        doc.setTextColor(255, 204, 0);
        doc.setFontSize(20);
        doc.text("QUIZ ENROLLMENT REPORT", 105, 25, { align: "center" });

        const tableRows = quizEnrollments.map(item => [
            item.student_name,
            item.quiz_name,
            `LKR ${item.amount}`,
            item.payment_method,
            item.status
        ]);

        autoTable(doc, {
            startY: 50,
            head: [["Student", "Quiz Name", "Price", "Method", "Status"]],
            body: tableRows,
            headStyles: { fillColor: [0, 35, 71], textColor: [255, 204, 0] }
        });
        doc.save("Quiz_Enrollments.pdf");
    };


    const handleCourseStatus = async (id, newStatus) => {
        try {
            await API.put(`/admin/course/verify-payment/${id}`, { status: newStatus });
            setCourseEnrollments(prev => prev.map(item => item.enrollment_id === id ? { ...item, payment_status: newStatus } : item));
            Swal.fire({ icon: "success", title: "Course Status Updated", timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire("Error", "Update failed", "error");
        }
    };

    const handleQuizStatus = async (paymentId, newStatus) => {
        try {
            await API.put("/admin/quiz/verify-payment", { paymentId, status: newStatus });
            setQuizEnrollments(prev => prev.map(item => item.payment_id === paymentId ? { ...item, status: newStatus } : item));
            Swal.fire({ icon: "success", title: "Quiz Status Updated", timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire("Error", "Update failed", "error");
        }
    };

    const showImage = (path) => {
        Swal.fire({
            imageUrl: `${BACKEND_URL}/${path.replace(/\\/g, "/")}`,
            confirmButtonColor: "#002347",
        });
    };

    if (loading) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="admin-dashboard-wrapper" style={{ marginRight: "450px"}}>
            <main className="admin-main-content">
                
                {/*  Section 1: Course Enrollments  */}
                <div style={{ marginBottom: "50px" }}>
                    <h1 className="dashboard-title-text" style={{paddingBottom: "30px"}}>Course Enrollment Requests 🎓</h1>
                    <div className="card-panel admin-table-container" style={{maxWidth: "1200px"}}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Student & Email</th>
                                    <th>Course</th>
                                    <th>Price</th>
                                    <th>Slip</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Payment Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courseEnrollments.map((item) => (
                                    <tr key={item.enrollment_id} className="table-row-hover">
                                        <td>{item.student_name}<br/><small>{item.student_email}</small></td>
                                        <td>{item.course_name}</td>
                                        <td>LKR {item.course_price}</td>
                                        <td>
                                            {item.payment_slip ? 
                                                <img src={`${BACKEND_URL}/${item.payment_slip.replace(/\\/g, "/")}`} 
                                                     alt="slip" style={{width:"40px", cursor:"pointer"}} 
                                                     onClick={() => showImage(item.payment_slip)}/> 
                                                : <span style={{color:"red"}}>No Slip</span>}
                                        </td>
                                        <td>{new Date(item.enroll_date).toLocaleString()}</td>
                                        <td>{item.student_account_status}</td>
                                        <td>
                                            <select className={`status-select ${item.payment_status.toLowerCase()}`}
                                                value={item.payment_status}
                                                onChange={(e) => handleCourseStatus(item.enrollment_id, e.target.value)}>
                                                <option value="Pending">Pending</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={generateCoursePDF} className="review-btn" style={{marginTop: "15px"}} >
                            📥 Download Course Enrollment Requests
                        </button>
                    </div>
                </div>

                {/*Section2 Quiz Enrollments  */}
                <div>
                    <h1 className="dashboard-title-text" style={{paddingBottom: "30px"}}>Quiz Enrollment Requests 📝</h1>
                    <div className="card-panel admin-table-container" style={{maxWidth: "1200px"}}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Quiz Name</th>
                                    <th>Price</th>
                                    <th>Slip</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Payment Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quizEnrollments.map((item) => (
                                    <tr key={item.payment_id} className="table-row-hover">
                                        <td>{item.student_name}</td>
                                        <td>{item.quiz_name}</td>
                                        <td>LKR {item.amount}</td>
                                        <td>
                                            {item.payment_slip ? 
                                                <img src={`${BACKEND_URL}/${item.payment_slip.replace(/\\/g, "/")}`} 
                                                     alt="slip" style={{width:"40px", cursor:"pointer"}} 
                                                     onClick={() => showImage(item.payment_slip)}/> 
                                                : <span style={{color:"red"}}>No Slip</span>}
                                        </td>
                                        <td>{new Date(item.created_at).toLocaleString()}</td>
                                        <td>{item.student_account_status}</td>
                                        <td>
                                            <select className={`status-select ${item.status.toLowerCase()}`}
                                                value={item.status}
                                                disabled={item.status === "Approved"}
                                                onChange={(e) => handleQuizStatus(item.payment_id, e.target.value)}>
                                                <option value="Pending">Pending</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={generateQuizPDF} className="review-btn"  style={{marginTop: "15px"}} >
                            📥 Download Quiz Enrollment Requests
                        </button>
                    </div>
                </div>

            </main>

             <button className="floating-back-btn" onClick={() => navigate("/a-dashbord")}>
          ← BACK TO DASHBOARD
        </button>
        </div>
    );
}