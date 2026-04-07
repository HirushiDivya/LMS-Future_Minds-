/*import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../API";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const order_id = searchParams.get("order_id");
    const type = searchParams.get("type");

    useEffect(() => {
        // backend - confirm payment
        if (order_id && type) {
            API.post("/pgateway/confirm-payment", { order_id, type })
                .then(res => console.log("Payment Confirmed"))
                .catch(err => console.error("Confirmation failed", err));
        }
    }, [order_id, type]);

    const handleDownload = () => {
        window.open(`http://localhost:5000/api/pgateway/generate-invoice/${order_id}?type=${type}`, "_blank");
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1 style={{ color: "green" }}>Payment Successful! 🎉</h1>
            <p>Payment successful! Your transaction is complete, and you now have full access to the course.</p>
            
            <button onClick={handleDownload} style={{ padding: "10px 20px", background: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                📄 Download Receipt (PDF)
            </button>
            <br /><br />
            <button onClick={() => navigate(`/content/course/${id}`)} style={{ background: "none", border: "1px solid #ccc", cursor: "pointer" }}>
                Back to Home
            </button>
        </div>
    );
}

*/

/*
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../API";
import Swal from "sweetalert2"; // SweetAlert2 add kala

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [courseId, setCourseId] = useState(null); // Course ID eka save karaganna

    const order_id = searchParams.get("order_id");
    const type = searchParams.get("type");

    useEffect(() => {
        if (order_id && type) {
            // Loading alert ekak pennanna backend eka confirm karana thuru
            Swal.fire({
                title: 'Confirming Payment...',
                didOpen: () => { Swal.showLoading() },
                allowOutsideClick: false
            });

            API.post("/pgateway/confirm-payment", { order_id, type })
                .then(res => {
                    console.log("Payment Confirmed", res.data);
                    
                    // Backend eken ewana course id eka set karaganna
                    // Res.data eke courseId kiyana field eka ewanawa kiyala mama hithanawa
                    const idFromBackend = res.data.courseId; 
                    setCourseId(idFromBackend);

                    Swal.fire({
                        icon: 'success',
                        title: 'Payment Successful!',
                        text: 'You have full access to the course now.',
                        timer: 3000,
                        showConfirmButton: false
                    });
                })
                .catch(err => {
                    console.error("Confirmation failed", err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong while confirming the payment.',
                    });
                });
        }
    }, [order_id, type]);

    const handleDownload = () => {
        window.open(`http://localhost:5000/api/pgateway/generate-invoice/${order_id}?type=${type}`, "_blank");
    };

    const goToCourse = () => {
        if (courseId) {
            navigate(`/content/course/${courseId}`);
        } else {
            // Id eka naththam home ekata hari dashboard ekata hari yawauna
            navigate("/student-dashboard"); 
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "Arial" }}>
            <div style={{ fontSize: "60px" }}>✅</div>
            <h1 style={{ color: "#28a745" }}>Thank You for Your Payment!</h1>
            <p style={{ fontSize: "18px", color: "#555" }}>
                Your transaction was successful. You can now start learning.
            </p>
            
            <div style={{ marginTop: "30px" }}>
                <button 
                    onClick={handleDownload} 
                    style={{ 
                        padding: "12px 25px", 
                        background: "#007bff", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "5px", 
                        cursor: "pointer",
                        marginRight: "10px",
                        fontWeight: "bold"
                    }}
                >
                    📄 Download Receipt
                </button>

                <button 
                    onClick={goToCourse} 
                    style={{ 
                        padding: "12px 25px", 
                        background: "#28a745", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "5px", 
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    Go to My Course ➔
                </button>
            </div>
        </div>
    );
}*/