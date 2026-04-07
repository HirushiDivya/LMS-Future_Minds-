const express = require("express");
const router = express.Router();
const db = require("../index");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const csv = require("csv-parser");
const fs = require("fs");
const bcrypt = require('bcrypt'); //for pw hash
const path = require('path');

// --- Multer Configuration---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // imge save  folder 
  },
  filename: (req, file, cb) => {
    // File -> unique name ( 171216500.jpg)
    cb(null, Date.now() + path.extname(file.originalname));
  }
});



//Admin dashbord
// http://localhost:5000/api/admin/dashboard-stats
router.get("/dashboard-stats", (req, res) => {
  const sql = `
        SELECT 
            (SELECT COUNT(*) FROM students) AS total_students,
            (SELECT COUNT(*) FROM courses) AS total_courses,
            (SELECT COUNT(*) FROM enrollments) AS total_enrollments,
            (SELECT COUNT(*) FROM Quizzes) AS total_quizzes,
            (SELECT COUNT(*) FROM Quiz_Payments WHERE status = 'Approved') AS approved_quiz_enrollmnts,
            (SELECT COUNT(*) FROM Quiz_Payments WHERE status = 'Pending') AS pending_quiz_enrollmnts,
            (SELECT COUNT(*) FROM enrollments WHERE payment_status = 'Approved') AS approved_enrollments,
            (SELECT COUNT(*) FROM enrollments WHERE payment_status = 'Pending') AS pending_enrollments
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Dashboard Stats Error:", err);
      return res.status(500).json({ error: "An error occurred while retrieving data.." });
    }
    res.json(results[0]);
  });
});

//http://localhost:5000/api/admin/
// GET all students
router.get("/", (req, res) => {
  db.query("SELECT * FROM students", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// http://localhost:5000/api/admin/course/all-enrollments
// All students enrollment requests (course)
router.get("/course/all-enrollments", (req, res) => {
  const sql = `
        SELECT 
            e.enrollment_id, 
            s.full_name AS student_name, 
            s.email AS student_email,
            s.status AS student_account_status,
            c.title AS course_name, 
            c.price AS course_price,
            e.payment_status, 
            e.payment_method,
            e.payment_slip,
            e.enroll_date
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.enroll_date DESC`; // Latest first

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }
    res.json(results);
  });
});

//http://localhost:5000/api/admin/course/pending-payments
//admin - all pending payments(course)
router.get("/course/pending-payments", (req, res) => {
  // JOIN - student + course tabls
  const sql = `
        SELECT 
            e.enrollment_id, 
            s.full_name AS student_name, 
            c.title AS course_name, 
            e.payment_slip, 
            e.enroll_date 
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN courses c ON e.course_id = c.id
        WHERE e.payment_status = 'Pending'`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

// --- SviewQuiz,Scoursecontent http://localhost:5000/api/admin/student/quiz-payments/:studentId
// student ->all quiz paymnt details
router.get("/student/quiz-payments/:studentId", (req, res) => {
    const { studentId } = req.params;

    const sql = `
        SELECT 
            qp.id AS payment_id,
            q.title AS quiz_name,
            qp.amount,
            qp.payment_method,
            qp.status,
            qp.payment_slip,
            qp.created_at
        FROM Quiz_Payments qp
        JOIN Quizzes q ON qp.quiz_id = q.id
        WHERE qp.student_id = ?
        ORDER BY qp.created_at DESC
    `;

    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "An error occurred while fetching data." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No quiz payments found for this student." });
        }

        res.json(results);
    });
});



// http://localhost:5000/api/admin/quiz/all-paymntrequests
router.get("/quiz/all-paymntrequests", (req, res) => {
    const sql = `
        SELECT 
            qp.id AS payment_id,
            s.full_name AS student_name,
            s.status AS student_account_status, --  Active/Deactive status 
            q.title AS quiz_name,
            qp.amount,
            qp.payment_method,
            qp.status,
            qp.payment_slip,
            qp.created_at
        FROM Quiz_Payments qp
        JOIN students s ON qp.student_id = s.id
        JOIN Quizzes q ON qp.quiz_id = q.id
        ORDER BY qp.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});



//http://localhost:5000/api/admin/student/:id
// GET 1 student
router.get("/student/:id", (req, res) => {
  const { id } = req.params;

  const sql =
    "SELECT id, full_name, email, mobile, created_at, status FROM students WHERE id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(results[0]);
  });
});


// http://localhost:5000/api/admin/student/:id
//update student details
router.put("/student/:id", async (req, res) => {
  const { id } = req.params;
  const { full_name, email, mobile, password, status } = req.body;

  let sql = "UPDATE students SET full_name = ?, email = ?, mobile = ?, status = ?";
  let values = [full_name, email, mobile, status || 'Active'];

  // Update the password only if provided by the admin.
  if (password && password.trim() !== "") {
    const hashedPassword = await bcrypt.hash(password, 10);
    sql += ", password = ?";
    values.push(hashedPassword);
  }

  sql += " WHERE id = ?";
  values.push(id);

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student updated successfully" });
  });
});


//http://localhost:5000/api/admin/api/admin/student/:id
//delete student
router.delete("/student/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM students WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      // Handle foreign key constraint
      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(400).json({
          error:
            "Cannot delete student. The student is already enrolled or has enrollment requests.",
        });
      }

      // Other errors
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  });
});



//http://localhost:5000/api/admin/course/verify-payment/1
// Admin- approve or reject payment(should have slip)
router.put("/course/verify-payment/:id", (req, res) => {
  const enrollId = req.params.id;
  const { status } = req.body;

  // check paymnt have slip or not
  const checkSql =
    "SELECT payment_slip FROM enrollments WHERE enrollment_id = ?";

  db.query(checkSql, [enrollId], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Enrollment ID could not found" });
    }

    // if have not slip admin can not approve
    if (!results[0].payment_slip) {
      return res.status(400).json({
        message:
          "This student has not yet submitted the payment receipt (Slip). Therefore, it cannot be approved.",
      });
    }

    // if only have slip update
    const sql =
      "UPDATE enrollments SET payment_status = ? WHERE enrollment_id = ?";

    db.query(sql, [status, enrollId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }

      res.json({
        message: `Payment ${status} successfully!`,
        enrollment_id: enrollId,
        new_status: status,
      });
    });
  });
});



//quiz
//fetch all quizzes associated with a specific course code
router.get("/quizzes-by-course/:course_code", (req, res) => {
  const { course_code } = req.params;
  const sql = "SELECT * FROM Quizzes WHERE course_id = ?";
  db.query(sql, [course_code], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 2. Get paid quizzes for a specific student
router.get("/my-quizzes/:userId", (req, res) => {
  const { userId } = req.params;
  const sql = "SELECT quiz_id FROM Quiz_Enrollments WHERE student_id = ? AND payment_status = 'approved'";
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result); // result = [{quiz_id: 1}, {quiz_id: 5}]
  });
});
 
 

//admin approve,reject quiz paymnt(bank slip upoad)
// http://localhost:5000/api/admin/quiz/verify-payment
router.put("/quiz/verify-payment", (req, res) => {
  const { paymentId, status } = req.body; // status = 'Approved' / 'Rejected'

  // check paymnt have or not
  const checkSql = "SELECT status FROM Quiz_Payments WHERE id = ?";

  db.query(checkSql, [paymentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ error: "Invalid Payment ID. No record found." });
    }

  
    if (results[0].status === status) {
      return res.status(400).json({ message: `This payment is already ${status}.` });
    }

    // status update -approve,reject
    const updateSql = "UPDATE Quiz_Payments SET status = ? WHERE id = ?";

    db.query(updateSql, [status, paymentId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ 
        message: `Quiz payment has been ${status.toLowerCase()} successfully!`,
        paymentId,
        newStatus: status 
      });
    });
  });
});

//get 1 question
// http://localhost:5000/api/admin/get-questions/:id
router.get("/get-questions/:id", (req, res) => {
  const quizId = req.params.id;

  const sql = "SELECT * FROM Questions WHERE quiz_id = ?";

  db.query(sql, [quizId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Check if the list is empty
    if (result.length === 0) {
      return res.status(404).json({ error: "No questions found for this quiz." });
    }

    // Return the entire array of questions, not just the first one
    res.json(result); 
  });
});

//get all quiz details
// http://localhost:5000/api/admin/all-quizzes
router.get("/all-quizzes", (req, res) => {
  const sql = "SELECT * FROM Quizzes";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Quiz list send to frontend
    res.json(results);
  });
});







//get 1 quiz by id
// http://localhost:5000/api/admin/quiz/:id
router.get("/quiz/:id", (req, res) => {
  const quizId = req.params.id;

  const quizSql = "SELECT * FROM Quizzes WHERE id = ?";

  db.query(quizSql, [quizId], (err, quizResult) => {
    if (err) return res.status(500).json({ error: err.message });

    if (quizResult.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const questionsSql = "SELECT * FROM Questions WHERE quiz_id = ?";

    db.query(questionsSql, [quizId], (err, questionsResult) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        ...quizResult[0],
        questions: questionsResult,
        questions_count: questionsResult.length,
      });
    });
  });
});








// http://localhost:5000/api/admin/all-enrollments
// all course enrollmnt details
router.get("/all-enrollments", (req, res) => {
    const sql = `
        SELECT 
            e.enrollment_id,
            s.full_name AS student_name,
            s.email AS student_email,
            c.title AS course_name,
            e.enroll_date,
            e.payment_status,
            e.payment_method
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.enroll_date DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// http://localhost:5000/api/admin/all-payments
// (Unified Payments View -course,quiz)
router.get("/all-payments", (req, res) => {
    const sql = `
        SELECT 
            e.enrollment_id AS payment_ref_id,
            s.full_name AS student_name,
            c.title AS item_name,
            'Course' AS type,
            c.price AS amount,
            e.payment_method,
            e.payment_status AS status,
            e.payment_slip,
            e.enroll_date AS date
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN courses c ON e.course_id = c.id

        UNION ALL

        SELECT 
            qp.id AS payment_ref_id,
            s.full_name AS student_name,
            q.title AS item_name,
            'Quiz' AS type,
            qp.amount,
            qp.payment_method,
            qp.status,
            qp.payment_slip,
            qp.created_at AS date
        FROM Quiz_Payments qp
        JOIN students s ON qp.student_id = s.id
        JOIN Quizzes q ON qp.quiz_id = q.id
        
        ORDER BY date DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
module.exports = router;
