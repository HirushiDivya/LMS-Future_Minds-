import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom'; // 1. මේ පේළිය අලුතින් එකතු කරන්න


const PaymentGateway = ({ props }) => {
    // orderData එක props විදියට හෝ hardcoded විදියට මෙතනට ගන්න පුළුවන්
    // උදා: { order_id: "1001", amount: 500, items: "Quiz Access", student_name: "Kasun" }

    const location = useLocation(); // 2. මේ පේළිය එකතු කරන්න
    const navigate = useNavigate(); // 3. මේ පේළිය එකතු කරන්න

    // 4. දැනට තිබෙන orderData එක වෙනුවට මේ පේළිය භාවිතා කරන්න
    // එමගින් Navigate වී එන විට දත්ත ලබාගත හැක, නැතිනම් ඔබ props හරහා දෙන දත්ත ගනී.
    const orderData = location.state?.orderData || props.orderData;


    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);

        try {
            // 1. Backend එකෙන් Hash එක ලබාගැනීම
            const response = await axios.post('http://localhost:5000/api/pgateway/generate-hash', {
                order_id: orderData.order_id,
                amount: orderData.amount,
                currency: "LKR"
            });

            const { hash } = response.data;

            // 2. PayHere වෙත යැවිය යුතු දත්ත (Payment Object)
            const payment = {
                sandbox: true, // Test කරන කාලයේදී true තබන්න. Live යද්දී false කරන්න.
                merchant_id: "1234249", // ඔබේ Merchant ID එක
                return_url: "http://localhost:3000/payment-success",
                cancel_url: "http://localhost:3000/payment-failed",
                notify_url: "http://localhost:5000/api/pgateway/payment-notify", // Backend Notify URL එක
                order_id: orderData.order_id,
                items: orderData.items,
                amount: orderData.amount,
                currency: "LKR",
                hash: hash, // Backend එකෙන් ආපු Hash එක
                first_name: orderData.student_name,
                last_name: "",
                email: "student@email.com",
                phone: "0712345678",
                address: "No. 1, Colombo",
                city: "Colombo",
                country: "Sri Lanka",
            };

            // 3. PayHere Checkout එක Open කිරීම (payhere.js library එක හරහා)
            // සටහන: index.html එකේ <script src="https://www.payhere.lk/lib/payhere.js"></script> දමා තිබිය යුතුය.
            window.payhere.onCompleted = function onCompleted(orderId) {
                console.log("Payment completed. OrderID:" + orderId);
                alert("ගෙවීම සාර්ථකයි!");
                // Success page එකට redirect කරන්න
            };

            window.payhere.onDismissed = function onDismissed() {
                console.log("Payment dismissed");
                alert("ගෙවීම අවලංගු කරන ලදී.");
            };

            window.payhere.onError = function onError(error) {
                console.log("Error:"  + error);
                alert("දෝෂයක් සිදු විය. නැවත උත්සාහ කරන්න.");
            };

            window.payhere.startPayment(payment);

        } catch (error) {
            console.error("Hash Generation Error:", error);
            alert("Hash එක ලබාගැනීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Payment Summary</h2>
            <p>Order ID: {orderData.order_id}</p>
            <p>Amount: LKR {orderData.amount}</p>
            
            <button 
                onClick={handlePayment} 
                disabled={loading}
                style={{
                    backgroundColor: '#eb4d4b',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                {loading ? "Processing..." : "Pay with PayHere"}
            </button>
        </div>
    );
};

export default PaymentGateway;