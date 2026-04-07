const express = require("express");
const router = express.Router();
const db = require("../index");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer"); //for send email
const crypto = require("crypto");  //for create random otp
 const jwt = require("jsonwebtoken");

//http://localhost:5000/api/students/
// GET all students
router.get("/", (req, res) => {
  db.query("SELECT * FROM students", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});



//http://localhost:5000/api/students/name/
// get 1 student by part of name
router.get("/:name", (req, res) => {
  const namePart = req.params.name;

  const sql = `
    SELECT id, full_name, email, mobile 
    FROM students 
    WHERE full_name LIKE ?
  `;

  db.query(sql, [`%${namePart}%`], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    res.json(result);
  });
});


// http://localhost:5000/api/students/profile/:email
// fetch student details using Email 
router.get("/profile/:email", (req, res) => {
  const studentEmail = req.params.email;

  const sql = `
    SELECT id, full_name, email, mobile, status, created_at 
    FROM students 
    WHERE email = ?
  `;

  db.query(sql, [studentEmail], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length === 0) {
      return res.status(404).json({ message: "Student not found with this email." });
    }

    res.json(result[0]);
  });
});



// get students by name OR email
router.get("/:query", (req, res) => {
  const searchTerm = req.params.query;

  const sql = `
    SELECT id, full_name, email, mobile 
    FROM students 
    WHERE full_name LIKE ? OR email LIKE ?
  `;

  db.query(sql, [`%${searchTerm}%`, `%${searchTerm}%`], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    res.json(result);
  });
});


// DELETE student by full name
router.delete("/name/:full_name", (req, res) => {
  const studentName = req.params.full_name;

  const sql = "DELETE FROM students WHERE full_name = ?";

  db.query(sql, [studentName], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found with that name" });
    }

    res.json({ message: "Student deleted successfully" });
  });
});


// DELETE student by email
router.delete("/email/:email", (req, res) => {
  const studentEmail = req.params.email;

  const sql = "DELETE FROM students WHERE email = ?";

  db.query(sql, [studentEmail], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found with that email" });
    }

    res.json({ message: "Student deleted successfully" });
  });
});



// student progress
router.get("/student-stats/:studentId", (req, res) => {
    const studentId = req.params.studentId;

    // student name + Course Progress 
    //  students table - JOIN-  full_name  ඇ.
    const courseSql = `
        SELECT 
            s.full_name,
            c.id AS course_id,
            c.title AS course_name,
            e.payment_status,
            e.progress AS course_progress_percentage,
            e.enroll_date
        FROM students s
        LEFT JOIN enrollments e ON s.id = e.student_id
        LEFT JOIN courses c ON e.course_id = c.id
        WHERE s.id = ?`;

    // Quiz Attempts 
    const quizSql = `
        SELECT 
            q.title AS quiz_name,
            qp.status AS payment_status,
            qa.score,
            qa.total_questions,
            qa.attempt_date,
            (SELECT COUNT(*) FROM Quiz_Attempts WHERE student_id = ? AND quiz_id = q.id) AS attempt_count
        FROM Quizzes q
        LEFT JOIN Quiz_Payments qp ON q.id = qp.quiz_id AND qp.student_id = ?
        LEFT JOIN Quiz_Attempts qa ON q.id = qa.quiz_id AND qa.student_id = ?
        WHERE qp.student_id = ? OR qa.student_id = ?`;

    db.query(courseSql, [studentId], (err, courses) => {
        if (err) return res.status(500).json(err);

       
        const studentName = courses.length > 0 ? courses[0].full_name : "Unknown Student";

        db.query(quizSql, [studentId, studentId, studentId, studentId, studentId], (err, quizzes) => {
            if (err) return res.status(500).json(err);

            res.json({
                studentId: studentId,
                full_name: studentName, //  send to Frontend  
                enrolledCourses: courses[0]?.course_id ? courses : [], // have not ay enrollmnts- send empty arry
                quizActivity: quizzes
            });
        });
    });
});



// http://localhost:5000/api/students/student-stats/1

//student prgress
router.get("/student-stats/:studentId", (req, res) => {
    const studentId = req.params.studentId;

    // (Course Progress & Payments)
    const courseSql = `
        SELECT 
            c.id AS course_id,
            c.title AS course_name,
            e.payment_status,
            e.progress AS course_progress_percentage,
            e.enroll_date
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = ?`;

    //(Quiz Attempts & Payments)
    const quizSql = `
        SELECT 
            q.title AS quiz_name,
            qp.status AS payment_status,
            qa.score,
            qa.total_questions,
            qa.attempt_date,
            (SELECT COUNT(*) FROM Quiz_Attempts WHERE student_id = ? AND quiz_id = q.id) AS attempt_count
        FROM Quizzes q
        LEFT JOIN Quiz_Payments qp ON q.id = qp.quiz_id AND qp.student_id = ?
        LEFT JOIN Quiz_Attempts qa ON q.id = qa.quiz_id AND qa.student_id = ?
        WHERE qp.student_id = ? OR qa.student_id = ?`;

    db.query(courseSql, [studentId], (err, courses) => {
        if (err) return res.status(500).json(err);

        db.query(quizSql, [studentId, studentId, studentId, studentId, studentId], (err, quizzes) => {
            if (err) return res.status(500).json(err);

            res.json({
                studentId: studentId,
                enrolledCourses: courses,
                quizActivity: quizzes
            });
        });
    });
});



// http://localhost:5000/api/students/student-progress/:studentId
// progress for all courses
router.get('/student-progress/:studentId', (req, res) => {
    const studentId = req.params.studentId;

    const sql = `
        SELECT 
            c.id AS course_id,
            c.title AS course_title,
            (SELECT COUNT(*) FROM coursecontent WHERE course_code = c.course_code) AS total_lessons,
            COUNT(DISTINCT cp.content_id) AS completed_lessons,
            IFNULL(ROUND((COUNT(DISTINCT cp.content_id) / (SELECT COUNT(*) FROM coursecontent WHERE course_code = c.course_code)) * 100, 2), 0) AS progress_percentage
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN coursecontent cc ON c.course_code = cc.course_code
        LEFT JOIN content_progress cp ON cc.id = cp.content_id AND cp.student_id = e.student_id
        WHERE e.student_id = ? AND e.payment_status = 'Approved'
        GROUP BY c.id;
    `;

    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database Error", error: err.message });
        }
        res.status(200).json({
            success: true,
            data: results
        });
    });
});

// http://localhost:5000/api/students/mark-completed
// mark lesson as complete (Mark as Completed)
router.post('/mark-completed', (req, res) => {
    const { student_id, content_id } = req.body;

    const sql = `
        INSERT INTO content_progress (student_id, content_id, status) 
        VALUES (?, ?, 'Completed') 
        ON DUPLICATE KEY UPDATE status = 'Completed', completed_at = CURRENT_TIMESTAMP
    `;

    db.query(sql, [student_id, content_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Failed to update progress", error: err.message });
        }
        res.status(200).json({ 
            success: true, 
            message: "Progress updated successfully!" 
        });
    });
});

 
//http://localhost:5000/api/students/
// GET all students
router.get("/", (req, res) => {
  db.query("SELECT * FROM students", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});



//http://localhost:5000/api/students/name/
// get 1 student by part of name
router.get("/:name", (req, res) => {
  const namePart = req.params.name;

  const sql = `
    SELECT id, full_name, email, mobile 
    FROM students 
    WHERE full_name LIKE ?
  `;

  db.query(sql, [`%${namePart}%`], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    res.json(result);
  });
});


// http://localhost:5000/api/students/profile/:email
// fetch student details using Email 
router.get("/profile/:email", (req, res) => {
  const studentEmail = req.params.email;

  const sql = `
    SELECT id, full_name, email, mobile, status, created_at 
    FROM students 
    WHERE email = ?
  `;

  db.query(sql, [studentEmail], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length === 0) {
      return res.status(404).json({ message: "Student not found with this email." });
    }

    res.json(result[0]);
  });
});



// get students by name OR email
router.get("/:query", (req, res) => {
  const searchTerm = req.params.query;

  const sql = `
    SELECT id, full_name, email, mobile 
    FROM students 
    WHERE full_name LIKE ? OR email LIKE ?
  `;

  db.query(sql, [`%${searchTerm}%`, `%${searchTerm}%`], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    res.json(result);
  });
});


// DELETE student by full name
router.delete("/name/:full_name", (req, res) => {
  const studentName = req.params.full_name;

  const sql = "DELETE FROM students WHERE full_name = ?";

  db.query(sql, [studentName], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found with that name" });
    }

    res.json({ message: "Student deleted successfully" });
  });
});


// DELETE student by email
router.delete("/email/:email", (req, res) => {
  const studentEmail = req.params.email;

  const sql = "DELETE FROM students WHERE email = ?";

  db.query(sql, [studentEmail], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found with that email" });
    }

    res.json({ message: "Student deleted successfully" });
  });
});




// http://localhost:5000/api/students/student-progress/:studentId
// progress fro all course(student's)
router.get('/student-progress/:studentId', (req, res) => {
    const studentId = req.params.studentId;

    const sql = `
        SELECT 
            c.id AS course_id,
            c.title AS course_title,
            (SELECT COUNT(*) FROM coursecontent WHERE course_code = c.course_code) AS total_lessons,
            COUNT(DISTINCT cp.content_id) AS completed_lessons,
            IFNULL(ROUND((COUNT(DISTINCT cp.content_id) / (SELECT COUNT(*) FROM coursecontent WHERE course_code = c.course_code)) * 100, 2), 0) AS progress_percentage
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN coursecontent cc ON c.course_code = cc.course_code
        LEFT JOIN content_progress cp ON cc.id = cp.content_id AND cp.student_id = e.student_id
        WHERE e.student_id = ? AND e.payment_status = 'Approved'
        GROUP BY c.id;
    `;

    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database Error", error: err.message });
        }
        res.status(200).json({
            success: true,
            data: results
        });
    });
});

// http://localhost:5000/api/students/mark-completed
// Mark as Completed
router.post('/mark-completed', (req, res) => {
    const { student_id, content_id } = req.body;

    const sql = `
        INSERT INTO content_progress (student_id, content_id, status) 
        VALUES (?, ?, 'Completed') 
        ON DUPLICATE KEY UPDATE status = 'Completed', completed_at = CURRENT_TIMESTAMP
    `;

    db.query(sql, [student_id, content_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Failed to update progress", error: err.message });
        }
        res.status(200).json({ 
            success: true, 
            message: "Progress updated successfully!" 
        });
    });
});
//http://localhost:5000/api/students/course-progress
// Get Overall Course Completion Percentage
// http://localhost:5000/api/students/course-progress/:studentId
router.get('/course-progress/:studentId', (req, res) => {
    const student_id = req.params.studentId;

    const sql = `
        SELECT 
            -- 1. ශිෂ්‍යයා සම්පූර්ණ කර ඇති content ගණන
            (SELECT COUNT(*) FROM content_progress 
             WHERE student_id = ? AND status = 'Completed') AS completed_count,

            -- 2. ශිෂ්‍යයා Enroll වී ඇති පාඨමාලා වල ඇති මුළු content ගණන
            (SELECT COUNT(*) FROM coursecontent cc
             JOIN enrollments e ON cc.course_code = (SELECT course_code FROM courses WHERE id = e.course_id)
             WHERE e.student_id = ? AND e.payment_status = 'Approved') AS total_count
    `;

    db.query(sql, [student_id, student_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const completed_count = results[0].completed_count || 0;
        const total_count = results[0].total_count || 0;
        
        const percentage = total_count > 0 ? Math.round((completed_count / total_count) * 100) : 0;

        res.json({ course_completion_percentage: percentage });
    });
});


module.exports = router;
