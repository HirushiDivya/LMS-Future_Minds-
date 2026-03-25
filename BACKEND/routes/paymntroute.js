const express = require("express");
const router = express.Router();
const db = require("../index");
const multer = require('multer');
const upload = multer({ dest: 'uploads/slips/' }); // Slip save වෙන තැන

//http://localhost:5000/api/payment/pay-bank
/*
{
key   - enrollment_id = 1 ,3
value - slip -> file ->upload
}
*/
//student upload paymnt slip (course)
router.post('/pay-bank', upload.single('slip'), (req, res) => {
    // 1. File එක ලැබුණාද කියලා check කරන්න
    if (!req.file) {
        return res.status(400).json({ error: "File එක ලැබුණේ නැත. Postman එකේ 'slip' Key එක සහ File එක පරීක්ෂා කරන්න." });
    }

    const { enrollment_id } = req.body;
    const slipPath = req.file.path; // මෙතන path එක 'uploads\\filename' විදිහට එනවා

    const sql = "UPDATE enrollments SET payment_slip = ?, payment_method = 'Bank', payment_status = 'Pending' WHERE enrollment_id = ?";
    
    db.query(sql, [slipPath, enrollment_id], (err, result) => {
        if (err) return res.status(500).json(err);

        // 2. ඇත්තටම row එකක් update වුණාද බලන්න (ID එක වැරදි නම් update වෙන්නේ නැහැ)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "ලබාදුන් enrollment_id එක සොයාගත නොහැක." });
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
            return res.status(500).json({ error: "දත්ත ලබා ගැනීමේදී දෝෂයක් සිදුවිය." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "ඔබ තවමත් කිසිදු පාඨමාලාවකට ලියාපදිංචි වී නැත." });
        }

        res.json(results);
    });
});




//Quiz paymnt- bankslip
//http://localhost:5000/api/payment/quiz/upload-bank-slip
router.post('/quiz/upload-bank-slip', upload.single('slip'), (req, res) => {
    const { student_id, quiz_id, amount } = req.body;
    const slipPath = req.file ? req.file.path : null;

    if (!slipPath) {
        return res.status(400).json({ error: "Please upload the payment slip." });
    }

    // already pay or not
    const checkSql = "SELECT * FROM Quiz_Payments WHERE student_id = ? AND quiz_id = ?";
    
    db.query(checkSql, [student_id, quiz_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        // 2. already have record(pending or approvl)
        if (results.length > 0) {
            const existingStatus = results[0].status;
            return res.status(400).json({ 
                error: `You have already submitted a payment request for this quiz. Current status: ${existingStatus}` 
            });
        }

        // if have not record add new
        const sql = "INSERT INTO Quiz_Payments (student_id, quiz_id, amount, payment_method, status, payment_slip) VALUES (?, ?, ?, 'Bank', 'Pending', ?)";
        
        db.query(sql, [student_id, quiz_id, amount, slipPath], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Quiz Payment slip uploaded successfully. Waiting for admin approval." });
        });
    });
}); 




// --- අලුතින් එක් කරන කොටස ---

// Course Payment - Bank Slip (Enrollment Table Update)
// URL: http://localhost:5000/api/payment/course/upload-bank-slip
router.post('/course/upload-bank-slip', upload.single('slip'), (req, res) => {
    const { student_id, course_id } = req.body;
    const slipPath = req.file ? req.file.path : null;

    if (!slipPath) {
        return res.status(400).json({ error: "කරුණාකර බැංකු රිසිට්පත (Slip) ලබා දෙන්න." });
    }

    // 1. දැනටමත් මෙම කෝස් එකට ගෙවීමක් කර ඇත්දැයි බැලීම
    const checkSql = "SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?";
    
    db.query(checkSql, [student_id, course_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        // 2. දැනටමත් රෙකෝඩ් එකක් තිබේ නම්, එය Update කිරීම (සමහර විට කලින් එක Rejected වී තිබිය හැක)
        if (results.length > 0) {
            const updateSql = `
                UPDATE enrollments 
                SET payment_slip = ?, payment_method = 'Bank', payment_status = 'Pending' 
                WHERE student_id = ? AND course_id = ?
            `;
            
            db.query(updateSql, [slipPath, student_id, course_id], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                return res.json({ message: "Course payment slip updated successfully. Waiting for admin approval." });
            });
        } else {
            // 3. රෙකෝඩ් එකක් නැත්නම් අලුතින් ඇතුළත් කිරීම (Insert)
            const insertSql = `
                INSERT INTO enrollments 
                (student_id, course_id, payment_method, payment_slip, payment_status) 
                VALUES (?, ?, 'Bank', ?, 'Pending')
            `;
            
            db.query(insertSql, [student_id, course_id, slipPath], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Course enrollment and slip upload successful. Waiting for admin approval." });
            });
        }
    });
});

module.exports = router;