const express = require("express");
const router = express.Router();
const db = require("../index");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer"); //for send email
const crypto = require("crypto");  //for create random otp
 
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


// get students by name OR email
router.get("/:query", (req, res) => {
  const searchTerm = req.params.query;

  const sql = `
    SELECT id, full_name, email, mobile 
    FROM students 
    WHERE full_name LIKE ? OR email LIKE ?
  `;

  // searchTerm එක නමටයි, ඊමේල් එකටයි දෙකටම පාවිච්චි කරනවා
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



const jwt = require("jsonwebtoken");

// http://localhost:5000/api/students/student-stats/1
// ශිෂ්‍යයාගේ සම්පූර්ණ ප්‍රගතිය (Courses, Quizzes & Progress) බැලීමට
router.get("/student-stats/:studentId", (req, res) => {
    const studentId = req.params.studentId;

    // 1. පාඨමාලා සහ ඒවායේ ප්‍රගතිය (Course Progress & Payments)
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

    // 2. Quiz වල තොරතුරු සහ ලකුණු (Quiz Attempts & Payments)
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

    // Queries එකවර run කිරීම සඳහා Promise භාවිතා කළ හැක (නැතහොත් nested callbacks)
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


module.exports = router;
