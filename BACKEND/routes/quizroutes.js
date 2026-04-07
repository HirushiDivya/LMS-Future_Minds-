const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const db = require("../index");

//file -> upload folder
const upload = multer({ dest: 'uploads/' });
 
const checkQuizAccess = (req, res, next) => {
    // quizId-> URL path 
    const quizId = req.params.quizId; 
    // studentId-> query string  (?studentId=4)
    const studentId = req.query.studentId;

    if (!studentId) {
        return res.status(400).json({ message: "studentId is required in query params" });
    }

    const sql = "SELECT status FROM Quiz_Payments WHERE student_id = ? AND quiz_id = ? AND status = 'Approved'";
    
    db.query(sql, [studentId, quizId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            next(); // if only approve paymnt process
        } else {
            res.status(403).json({ message: "Access Denied. Please complete payment and wait for admin approval." });
        }
    });
};


// http://localhost:5000/api/quiz/quiz-count
// quiz count
router.get("/quiz-count", (req, res) => {

    const sql = "SELECT COUNT(*) AS total_quizzes FROM Quizzes";

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ 
                error: "Internal Server Error", 
                details: err.message 
            });
        }

        res.json({
            total_quizzes: result[0].total_quizzes
        });
    });
});

// 7.get all quizes
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
// http://localhost:5000/api/quiz/course/:courseId
router.get("/course/:courseId", (req, res) => {
    const courseId = req.params.courseId;
    const sql = "SELECT * FROM Quizzes WHERE course_id = ?";

    db.query(sql, [courseId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// Enrolled student count
router.get("/enrollment-count/:quizId", (req, res) => {
    const quizId = req.params.quizId;

    const sql = "SELECT COUNT(*) AS count FROM Quiz_Payments WHERE quiz_id = ? AND status = 'Approved'";

    db.query(sql, [quizId], (err, results) => {
        if (err) return res.status(500).json(0);
        
        // only count
        const count = results[0].count || 0;
        res.json(count); 
    });
});


// http://localhost:5000/api/quiz/get-questions/:quizId
router.get('/get-questions/:quizId', checkQuizAccess, (req, res) => {
    const quizId = req.params.quizId;

    const sql = `
        SELECT 
            q.id AS quiz_id,
            que.id AS question_id,
            que.question_text,
            que.correct_option,
            que.option_a, que.explanation_a,
            que.option_b, que.explanation_b,
            que.option_c, que.explanation_c,
            que.option_d, que.explanation_d
        FROM Quizzes q
        JOIN Questions que ON q.id = que.quiz_id
        WHERE q.id = ?
    `;
    
    db.query(sql, [quizId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (!results || results.length === 0) {
            return res.status(404).json({ message: "No questions found for this quiz." });
        }

        const quizData = {
            quizId: results[0].quiz_id, 
            questions: results.map(row => ({
                id: row.question_id,
                question_text: row.question_text,
                correct_option: row.correct_option,
                options: {
                    a: row.option_a,
                    b: row.option_b,
                    c: row.option_c,
                    d: row.option_d
                },
                explanations: {
                    a: row.explanation_a,
                    b: row.explanation_b,
                    c: row.explanation_c,
                    d: row.explanation_d
                }
            }))
        };
        res.json(quizData);
    });
}); 

//http://localhost:5000/api/quiz/create-quiz
// 3.create new quiz (Header Data)
router.post("/create-quiz",upload.single('Quiz_IMG'), (req, res) => {
  const { title, qdescription, expires_at, time_limit_minutes, price, course_id, image_url } = req.body;


  let final_img = 'default-image.jpg';

    if (req.file) {
        final_img = req.file.filename; 
    } else if (image_url) {
        final_img = image_url; 
    }

  const sql = "INSERT INTO Quizzes (title, qdescription, expires_at, time_limit_minutes, price, course_id, Quiz_IMG) VALUES (?, ?, ?, ?, ?, ?, ?)";

  db.query(sql, [title, qdescription, expires_at, time_limit_minutes, price, course_id, final_img], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Quiz created successfully", quizId: result.insertId, fileName: final_img  });
  });
});
// 4.Questions Bulk Upload using .CSV
// http://localhost:5000/api/quiz/upload-questions/:quizId
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



// http://localhost:5000/api/quiz/student-enrolled-count/:studentId
// ශිෂ්‍යයෙක් enroll වී ඇති මුළු quiz ගණන ලබා ගැනීම
router.get("/student-enrolled-count/:studentId", (req, res) => {
    const studentId = req.params.studentId;

    const sql = `
        SELECT COUNT(*) AS enrolled_count 
        FROM Quiz_Payments 
        WHERE student_id = ? AND status = 'Approved'
    `;

    db.query(sql, [studentId], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.json({
            student_id: studentId,
            enrolled_count: result[0].enrolled_count || 0
        });
    });
});


//get 1 quiz by id
// http://localhost:5000/api/quiz/quiz/:id
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


// student submit quiz
// http://localhost:5000/api/submit-quiz
router.post('/submit-quiz', (req, res) => {
    const { studentId, quizId, answers } = req.body;

    const checkPaymentSql = "SELECT * FROM Quiz_Payments WHERE student_id = ? AND quiz_id = ? AND status = 'Approved'";

    db.query(checkPaymentSql, [studentId, quizId], (paymentErr, paymentResults) => {
        if (paymentErr) return res.status(500).json({ error: paymentErr.message });

        if (paymentResults.length === 0) {
            return res.status(403).json({ 
                error: "Access Denied. You must pay and get admin approval before submitting this quiz." 
            });
        }
 
        const sql = `
            SELECT id, question_text, correct_option, 
                   option_a, explanation_a, 
                   option_b, explanation_b, 
                   option_c, explanation_c, 
                   option_d, explanation_d 
            FROM Questions WHERE quiz_id = ?
        `;
        
        db.query(sql, [quizId], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });

            let score = 0;
            const totalQuestions = results.length;
            const reviewData = []; 

            results.forEach((q) => {
                const studentAns = answers.find(a => a.questionId === q.id);
                const isCorrect = studentAns && studentAns.selected === q.correct_option;

                if (isCorrect) score++;

                reviewData.push({
                    questionId: q.id,
                    question_text: q.question_text,
                    studentSelected: studentAns ? studentAns.selected : null,
                    correctOption: q.correct_option,
                    isCorrect: isCorrect,
                    explanation: q[`explanation_${q.correct_option.toLowerCase()}`] 
                });
            });

            const saveSql = "INSERT INTO Quiz_Attempts (student_id, quiz_id, score, total_questions) VALUES (?, ?, ?, ?)";
            db.query(saveSql, [studentId, quizId, score, totalQuestions], (saveErr) => {
                if (saveErr) return res.status(500).json({ error: saveErr.message });
                
                res.json({ 
                    message: "Quiz submitted successfully!", 
                    score: score, 
                    total: totalQuestions,
                    review: reviewData 
                });
            });
        });
    }); 
});



//8.delete 1 quiz
// http://localhost:5000/api/quiz/delete-quiz/:id
router.delete("/delete-quiz/:id", (req, res) => {
  const quizId = req.params.id;

  const sql = "DELETE FROM Quizzes WHERE id = ?";

  db.query(sql, [quizId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    // check db
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Quiz not found or already deleted." });
    }

    res.json({ message: "Quiz deleted successfully!" });
  });
});

//10. delete all questions from quiz
// http://localhost:5000/api/quiz/clear-questions/:quizId
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

//u11.pdate quiz
// http://localhost:5000/api/quiz/update-quiz/:id
// router.put("/update-quiz/:id", ...)
router.put("/update-quiz/:id", upload.single('Quiz_IMG'), (req, res) => {
  const quizId = req.params.id;
  const { title, qdescription, time_limit_minutes, price, course_id,image_url, Quiz_IMG } = req.body;

  let final_img = "";

  if (req.file) {
        final_img = req.file.filename;
    } else if (image_url && image_url.startsWith('http')) {
        final_img = image_url;
    } else {
        final_img = Quiz_IMG;
    }

  const sql =
    "UPDATE Quizzes SET title = ?, qdescription = ?, time_limit_minutes = ?, price = ?, course_id = ? , Quiz_IMG = ? WHERE id = ?";

  db.query(sql, [title, qdescription, time_limit_minutes, price, course_id, final_img, quizId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Quiz not found." });
    }

    res.json({ message: "Quiz updated successfully!", fileName: final_img });
  });
});

/// 12.update question
// http://localhost:5000/api/quiz/update-question/:id
router.put("/update-question/:id", (req, res) => {
  const questionId = req.params.id;
  const {
    question_text,
    option_a,
    explanation_a, 
    option_b,
    explanation_b, 
    option_c,
    explanation_c, 
    option_d,
    explanation_d, 
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
    explanation_a || null, 
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



//14. get question count from quiz
// http://localhost:5000/api/quiz/questions-only-count/:id
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

// 9.delete 1  question
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

// http://localhost:5000/api/quiz/progress/:studentId/:quizId
// Quiz ekakata adala student progress percentage eka ganna
router.get("/progress/:studentId/:quizId", (req, res) => {
    const { studentId, quizId } = req.params;

    // Student me quiz eka attempt karala thiyenawada kiyala balanawa
    const sql = "SELECT id FROM Quiz_Attempts WHERE student_id = ? AND quiz_id = ?";

    db.query(sql, [studentId, quizId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Record ekak thiyenawanam progress eka 100%, nattnam 0%
        const progress = results.length > 0 ? 100 : 0;

        res.json({
            student_id: studentId,
            quiz_id: quizId,
            progress_percentage: progress
        });
    });
});

 
// http://localhost:5000/api/quiz/total-progress/:studentId
router.get("/total-progress/:studentId", (req, res) => {
    const studentId = req.params.studentId;

    // 1. Approved enrollments (Ganna thiyena total quizzes)
    const sqlEnrolled = "SELECT COUNT(*) AS total FROM Quiz_Payments WHERE student_id = ? AND status = 'Approved'";
    
    // 2. Already attempted quizzes (Iwara karapu quizzes)
    const sqlAttempted = "SELECT COUNT(DISTINCT quiz_id) AS completed FROM Quiz_Attempts WHERE student_id = ?";

    db.query(sqlEnrolled, [studentId], (err, enrolledRes) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query(sqlAttempted, [studentId], (err, attemptedRes) => {
            if (err) return res.status(500).json({ error: err.message });

            const total = enrolledRes[0].total || 0;
            const completed = attemptedRes[0].completed || 0;

            // Percentage eka calculate kireema
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            res.json({
                total_quizzes: total,
                completed_quizzes: completed,
                overall_progress: percentage
            });
        });
    });
});




module.exports = router;