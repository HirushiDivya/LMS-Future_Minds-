const express = require("express");
const router = express.Router();
const db = require("../index");


//http://localhost:5000/api/enroll/enroll-request
/*
{
"student_id": 1,
"course_id": 1
}
*/
//new enroll request by student
router.post('/enroll-request', (req, res) => {
    const { student_id, course_id } = req.body;

    const enrollSql = "INSERT INTO enrollments (student_id, course_id, payment_status) VALUES (?, ?, 'Pending')";
    
    db.query(enrollSql, [student_id, course_id], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ 
                    message: "You are already enrolled in this course." 
                });
            }
            return res.status(500).json(err);
        }
        
        res.json({ 
            message: "Enrollment request submitted. Please complete the payment and wait for Admin confirmation.",
            enrollmentId: result.insertId 
        });
    });
});


 
//http://localhost:5000/api/enroll/my-dashboard/1
//student's enrollement request,approve,pending or rejected
/*
router.get("/my-dashboard/:studentId", (req, res) => {
    const studentId = req.params.studentId;

    const sql = `
        SELECT 
            c.course_code,
            c.title, 
            c.price, 
            e.payment_status, 
            CASE 
                WHEN e.payment_status = 'Approved' THEN c.materials_link 
                ELSE 'Locked: Please Complete Payment' 
            END AS student_access
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = ?`;

    db.query(sql, [studentId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});
*/

router.get("/my-dashboard/:studentId", (req, res) => {
    const studentId = req.params.studentId;

    const sql = `
        SELECT 
            c.course_code,
            c.title, 
            c.price, 
            e.payment_status, 
            s.status AS student_account_status, -- මෙන්න මේක අලුතින් එකතු කළා
            CASE 
                WHEN e.payment_status = 'Approved' AND s.status = 'Active' THEN c.materials_link 
                ELSE 'Locked' 
            END AS student_access
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN students s ON e.student_id = s.id -- Students table එක join කළා
        WHERE e.student_id = ?`;

    db.query(sql, [studentId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});
module.exports = router;