const express = require("express");
const router = express.Router();
const db = require("../index");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const csv = require("csv-parser");
const fs = require("fs");
const bcrypt = require('bcrypt'); //for pw hash

//http://localhost:5000/api/admin/
// GET all students
router.get("/", (req, res) => {
  db.query("SELECT * FROM students", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});


/*
// http://localhost:5000/api/admin/quiz/all-paymntrequests
// Admin - Get all quiz payment requests (Pending, Approved, Rejected)
router.get("/quiz/all-paymntrequests", (req, res) => {
    const sql = `
        SELECT 
            qp.id AS payment_id,
            s.full_name AS student_name,
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
*/

/*
// http://localhost:5000/api/admin/quiz/all-paymntrequests
// Admin - Get all quiz payment requests (Pending, Approved, Rejected)
router.get("/quiz/all-paymntrequests", (req, res) => {
    const sql = `
        SELECT 
            qp.id AS payment_id,
            s.full_name AS student_name,
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

        // පින්තූරය (BLOB) Base64 string එකක් බවට පත් කිරීම
        const processedResults = results.map(row => {
            if (row.payment_slip) {
                return {
                    ...row,
                    // Buffer එක base64 string එකක් ලෙස convert කරයි
                    payment_slip: row.payment_slip.toString('base64')
                };
            }
            return row;
        });

        res.json(processedResults);
    });
});
*/

// http://localhost:5000/api/admin/quiz/all-paymntrequests
router.get("/quiz/all-paymntrequests", (req, res) => {
    const sql = `
        SELECT 
            qp.id AS payment_id,
            s.full_name AS student_name,
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
        // කිසිදු වෙනසක් නැතිව කෙලින්ම results යවන්න
        res.json(results);
    });
});

////http://localhost:5000/api/admin/student/:id
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

  // ඇඩ්මින් නව password එකක් එවා ඇත්නම් පමණක් එය update කරන්න
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

//http://localhost:5000/api/admin/course/all-enrollments
//All students enrollment requests
router.get("/course/all-enrollments" , (req, res) => {
  const sql = `
        SELECT 
            e.enrollment_id, 
            s.full_name AS student_name, 
            s.email AS student_email,
            c.title AS course_name, 
            c.price AS course_price,
            e.payment_status, 
            e.payment_method,
            e.payment_slip,
            e.enroll_date
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.enroll_date DESC`; //Latest first

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ error: "දත්ත ලබා ගැනීමේදී දෝෂයක් සිදුවිය." });
    }
    res.json(results);
  });
});

//http://localhost:5000/api/admin/course/pending-payments
//admin - all pending payments
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
        .json({ message: "Enrollment ID එක සොයාගත නොහැක." });
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

//quiz
//http://localhost:5000/api/admin/create-quiz
// create new quiz (Header Data)
router.post("/create-quiz", (req, res) => {
  const { title, qdescription, expires_at, time_limit_minutes, price, course_id } = req.body;
  const sql = "INSERT INTO Quizzes (title, qdescription, expires_at, time_limit_minutes, price, course_id) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(sql, [title, qdescription, expires_at, time_limit_minutes, price, course_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Quiz created successfully", quizId: result.insertId });
  });
});

//http://localhost:5000/api/admin/upload-questions/:quizId
// 2.Questions Bulk Upload using .CSV
// http://localhost:5000/api/admin/upload-questions/:quizId
router.post("/upload-questions/:quizId", upload.single("file"), (req, res) => {
  const quizId = req.params.quizId;
  const filePath = req.file.path;
  const results = [];

  // CSV read start
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      // rows add to db
      results.forEach((row) => {
        // add Explanation 
        const sql = `
          INSERT INTO Questions 
          (quiz_id, question_text, option_a, explanation_a, option_b, explanation_b, option_c, explanation_c, option_d, explanation_d, correct_option) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // CSV  Column names (row.a_desc )
        const values = [
          quizId,
          row.question,      // Q
          row.a,             // Option A
          row.a_desc || null, // Explanation A 
          row.b,             // Option B
          row.b_desc || null, // Explanation B
          row.c,             // Option C
          row.c_desc || null, // Explanation C
          row.d,             // Option D
          row.d_desc || null, // Explanation D
          row.correct        // Correct answer(A, B, C, D)
        ];

        db.query(sql, values, (err) => {
          if (err) console.error("Error inserting row:", err);
        });
      });

      // Temporary file remove
      fs.unlinkSync(filePath);
      res.json({ message: "Questions with explanations uploaded successfully!" });
    });
});


/*
// http://localhost:5000/api/admin/quiz/approve-payment
//Quiz rewquest approve
router.post("/quiz/approve-payment", (req, res) => {
  const { paymentId } = req.body;

  // check exist state(pending or approve)
  const checkSql = "SELECT status FROM Quiz_Payments WHERE id = ?";

  db.query(checkSql, [paymentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // if paymntid not in db
    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "Invalid Payment ID. No record found." });
    }

    // already status = Approved 
    if (results[0].status === "Approved") {
      return res
        .status(400)
        .json({ message: "This payment has already been approved." });
    }

    // Status =! Approved => update 
    const updateSql =
      "UPDATE Quiz_Payments SET status = 'Approved' WHERE id = ?";

    db.query(updateSql, [paymentId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Payment approved and quiz access granted!" });
    });
  });
});
*/
// http://localhost:5000/api/admin/quiz/verify-payment
router.put("/quiz/verify-payment", (req, res) => {
  const { paymentId, status } = req.body; // status = 'Approved' හෝ 'Rejected'

  // 1. මුලින්ම ගෙවීමක් පවතීදැයි පරීක්ෂා කිරීම
  const checkSql = "SELECT status FROM Quiz_Payments WHERE id = ?";

  db.query(checkSql, [paymentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ error: "Invalid Payment ID. No record found." });
    }

    // 2. දැනටමත් තීරණයක් ගෙන ඇති පේමන්ට් එකක්දැයි බැලීම (Optional)
    if (results[0].status === status) {
      return res.status(400).json({ message: `This payment is already ${status}.` });
    }

    // 3. Status එක (Approved/Rejected) Update කිරීම
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

  // 1. Corrected the column name (assuming it's quiz_id) and added the closing quote
  const sql = "SELECT * FROM Questions WHERE quiz_id = ?";

  db.query(sql, [quizId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 2. Check if the list is empty
    if (result.length === 0) {
      return res.status(404).json({ error: "No questions found for this quiz." });
    }

    // 3. Return the entire array of questions, not just the first one
    res.json(result); 
  });
});

// get all quiz details
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


//get all quizes
// http://localhost:5000/api/admin/all-quizzes
router.get("/all-quizzes", (req, res) => {
  // LEFT JOIN + COUNT => question count
  const sql = `
    SELECT q.*, COUNT(qs.id) AS questions_count 
    FROM Quizzes q 
    LEFT JOIN Questions qs ON q.id = qs.quiz_id 
    GROUP BY q.id
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

//delete 1 quiz
// http://localhost:5000/api/admin/delete-quiz/:id
router.delete("/delete-quiz/:id", (req, res) => {
  const quizId = req.params.id;

  const sql = "DELETE FROM Quizzes WHERE id = ?";

  db.query(sql, [quizId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    // Database එකේ එවැනි Quiz ID එකක් තිබුණාදැයි බලයි
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Quiz not found or already deleted." });
    }

    res.json({ message: "Quiz deleted successfully!" });
  });
});

//delete 1  question
// http://localhost:5000/api/admin/delete-question/:id
router.delete("/delete-question/:id", (req, res) => {
  const questionId = req.params.id;

  // Questions id delete  
  const sql = "DELETE FROM Questions WHERE id = ?";

  db.query(sql, [questionId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Question not found." });
    }

    res.json({ message: "Question deleted successfully!" });
  });
});

//deleteall questions from quiz
// http://localhost:5000/api/admin/clear-questions/:quizId
router.delete("/clear-questions/:quizId", (req, res) => {
  const quizId = req.params.quizId;

  const sql = "DELETE FROM Questions WHERE quiz_id = ?";

  db.query(sql, [quizId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      message: `Cleared all ${result.affectedRows} questions from Quiz ID: ${quizId}`,
    });
  });
});

//update quiz
// http://localhost:5000/api/admin/update-quiz/:id
router.put("/update-quiz/:id", (req, res) => {
  const quizId = req.params.id;
  const { title, qdescription,expires_at, time_limit_minutes, price, course_id } = req.body;

  const sql =
    "UPDATE Quizzes SET title = ?, qdescription = ?, expires_at =? , time_limit_minutes = ?, price = ?, course_id = ? WHERE id = ?";

  db.query(sql, [title, qdescription, expires_at, time_limit_minutes, price, course_id, quizId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    //check changes
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Quiz not found." });
    }

    res.json({ message: "Quiz updated successfully!" });
  });
});

/// update question
// http://localhost:5000/api/admin/update-question/:id
router.put("/update-question/:id", (req, res) => {
  const questionId = req.params.id;
  const {
    question_text,
    option_a,
    explanation_a, // අලුතින් එක් කළා
    option_b,
    explanation_b, // අලුතින් එක් කළා
    option_c,
    explanation_c, // අලුතින් එක් කළා
    option_d,
    explanation_d, // අලුතින් එක් කළා
    correct_option,
  } = req.body;

  const sql = `UPDATE Questions 
               SET question_text = ?, 
                   option_a = ?, explanation_a = ?, 
                   option_b = ?, explanation_b = ?, 
                   option_c = ?, explanation_c = ?, 
                   option_d = ?, explanation_d = ?, 
                   correct_option = ? 
               WHERE id = ?`;

  const values = [
    question_text,
    option_a,
    explanation_a || null, // අගයක් නැතිනම් NULL ලෙස save වේ
    option_b,
    explanation_b || null,
    option_c,
    explanation_c || null,
    option_d,
    explanation_d || null,
    correct_option,
    questionId,
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Question not found." });
    }

    res.json({ message: "Question updated successfully!" });
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

//get question count from quiz
// http://localhost:5000/api/admin/questions-only-count/:id
router.get("/questions-only-count/:id", (req, res) => {
  const quizId = req.params.id;
  const sql =
    "SELECT COUNT(*) AS total_questions FROM Questions WHERE quiz_id = ?";

  db.query(sql, [quizId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      quiz_id: quizId,
      questions_count: result[0].total_questions,
    });
  });
}); 







// http://localhost:5000/api/admin/course/all-enrollments
// Admin - Get all course enrollment requests (All Statuses)
router.get("/course/all-enrollments", (req, res) => {
    const sql = `
        SELECT 
            e.enrollment_id,
            s.full_name AS student_name,
            c.title AS course_name,
            c.course_code,
            e.payment_method,
            e.payment_status,
            e.payment_slip,
            e.enroll_date,
            e.invoice_number
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.enroll_date DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});


// http://localhost:5000/api/admin/all-enrollments
// ලබාගන්නේ සියලුම Course Enrollments විස්තර පමණි
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
// Course සහ Quiz යන දෙකෙහිම ගෙවීම් විස්තර (Unified Payments View)
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
