const express = require("express");
const router = express.Router();
const db = require("../index");

/*
//All enrollements
router.get("/", (req, res) => {
    const sql = `
        SELECT 
            e.enrollment_id,
            s.full_name AS student_name, 
            c.title AS course_name, 
            e.enroll_date,
            e.progress, 
            e.payment_status 
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN courses c ON e.course_id = c.id`;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});
*/


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
            // Unique constraint එක නිසා එන error එක පරීක්ෂා කිරීම
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ 
                    message: "ඔබ දැනටමත් මෙම පාඨමාලාවට ලියාපදිංචි වී ඇත." 
                });
            }
            return res.status(500).json(err);
        }
        
        res.json({ 
            message: "ලියාපදිංචි වීමට ඉල්ලුම් කළා. කරුණාකර මුදල් ගෙවා Admin මගින් confirm කරගන්න.",
            enrollmentId: result.insertId 
        });
    });
});

//http://localhost:5000/api/enroll//my-dashboard/1
//student's enrollement request,approve,pending or rejected
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

module.exports = router;