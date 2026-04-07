const express = require("express");
const router = express.Router();
const db = require("../index");
const multer = require('multer');
const upload = multer({ dest: 'uploads/slips/' }); 
//banck paymnt -slip
//http://localhost:5000/api/payment/pay-bank
/*
{
key   - enrollment_id = 1 ,3
value - slip -> file ->upload
}
*/
//student upload paymnt slip (course)
router.post('/pay-bank', upload.single('slip'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded. Please check the 'slip' key and attach a file in Postman." });
    }

    const { enrollment_id } = req.body;
    const slipPath = req.file.path; 

    const sql = "UPDATE enrollments SET payment_slip = ?, payment_method = 'Bank', payment_status = 'Pending' WHERE enrollment_id = ?";
    
    db.query(sql, [slipPath, enrollment_id], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "The provided enrollment ID could not be found." });
        }

        res.json({ message: "Slip uploaded successfully!", path: slipPath });
    });
});



//check Payment Status by student
router.get("/my-payments/:student_id", (req, res) => {
    const studentId = req.params.student_id;

    const sql = `
        SELECT 
            e.enrollment_id, 
            c.title AS course_name, 
            c.price AS course_price,
            e.payment_status, 
            e.payment_method,
            e.enroll_date,
            e.invoice_number
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = ?
        ORDER BY e.enroll_date DESC`;

    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "An error occurred while fetching data." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "You are not enrolled in any courses yet." });
        }

        res.json(results);
    });
});




// Quiz Payment & Enrollment - Bank Slip
router.post('/quiz/upload-bank-slip', upload.single('slip'), (req, res) => {
    // 1. Frontend -> invoice_number 
    const { student_id, quiz_id, amount, invoice_number } = req.body;
    const slipPath = req.file ? req.file.path : null;

    if (!slipPath) {
        return res.status(400).json({ error: "Please upload the payment slip." });
    }

    const checkSql = "SELECT id FROM Quiz_Payments WHERE student_id = ? AND quiz_id = ?";
    
    db.query(checkSql, [student_id, quiz_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            // --- update record ---
            const paymentId = results[0].id;
            
            const updatePaySql = "UPDATE Quiz_Payments SET amount = ?, payment_slip = ?, status = 'Pending', payment_method = 'Bank' WHERE id = ?";
            
            //  UPDATE query + invoice_number
            const updateEnrollSql = "UPDATE Quiz_Enrollments SET payment_slip = ?, payment_status = 'Pending', payment_method = 'Bank', invoice_number = ? WHERE student_id = ? AND quiz_id = ?";

            db.query(updatePaySql, [amount, slipPath, paymentId], (err) => {
                if (err) return res.status(500).json({ error: err.message });

                db.query(updateEnrollSql, [slipPath, invoice_number, student_id, quiz_id], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: "Quiz payment and enrollment updated to Pending.", paymentId: paymentId });
                });
            });

        } else {
            // --- new Record  ---
            const insertPaySql = "INSERT INTO Quiz_Payments (student_id, quiz_id, amount, payment_method, status, payment_slip) VALUES (?, ?, ?, 'Bank', 'Pending', ?)";
            
            db.query(insertPaySql, [student_id, quiz_id, amount, slipPath], (err, payResult) => {
                if (err) return res.status(500).json({ error: err.message });

                const newPaymentId = payResult.insertId;

                const insertEnrollSql = "INSERT IGNORE INTO Quiz_Enrollments (student_id, quiz_id, payment_method, payment_slip, payment_status, invoice_number) VALUES (?, ?, 'Bank', ?, 'Pending', ?)";

                db.query(insertEnrollSql, [student_id, quiz_id, slipPath, invoice_number], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: "Quiz payment and enrollment submitted as Pending.", paymentId: newPaymentId });
                });
            });
        }
    });
});






router.post('/course/upload-bank-slip', upload.single('slip'), (req, res) => {
    const { student_id, course_id, amount, invoice_number } = req.body;
    const slipPath = req.file ? req.file.path : null;

    if (!slipPath) {
        return res.status(400).json({ error: "Please provide the bank slip." });
    }

    const paySql = `
        INSERT INTO Course_Payments (student_id, course_id, amount, status, payment_method, payment_slip, invoice_number) 
        VALUES (?, ?, ?, 'Pending', 'Bank', ?, ?)
        ON DUPLICATE KEY UPDATE 
        amount = VALUES(amount), 
        payment_slip = VALUES(payment_slip), 
        invoice_number = VALUES(invoice_number),
        status = 'Pending'`;

    db.query(paySql, [student_id, course_id, amount, slipPath, invoice_number], (err, payResult) => {
        if (err) {
            console.error("Payment Table Error:", err);
            return res.status(500).json({ error: "An error occurred while saving the payment record." });
        }

       
        const enrollSql = `
            INSERT INTO enrollments (student_id, course_id, payment_method, payment_slip, payment_status, invoice_number) 
            VALUES (?, ?, 'Bank', ?, 'Pending', ?)
            ON DUPLICATE KEY UPDATE 
            payment_slip = VALUES(payment_slip), 
            invoice_number = VALUES(invoice_number),
            payment_status = 'Pending'`;

        db.query(enrollSql, [student_id, course_id, slipPath, invoice_number], (err, enrollResult) => {
            if (err) {
                console.error("Enrollment Table Error:", err);
                return res.status(500).json({ error: "An error occurred while updating the enrollment record." });
            }

            
            const finalPaymentId = payResult.insertId; 

            res.json({ 
                message: "Payment and enrollment updated successfully.", 
                paymentId: finalPaymentId 
            });
        });
    });
});
module.exports = router;