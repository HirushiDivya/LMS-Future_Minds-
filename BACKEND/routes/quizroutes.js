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
/*
//http://localhost:5000/api/quiz/get-questions/:quizId
// student access quizes after check paymnt status
router.get('/get-questions/:quizId', checkQuizAccess, (req, res) => {
    const quizId = req.params.quizId;
    const studentId = req.query.studentId; //student id from frontend

    const sql = "SELECT id, question_text, option_a, option_b, option_c, option_d FROM Questions WHERE quiz_id = ?";
    
    db.query(sql, [quizId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json(results);
    });
});

*/
/*
// http://localhost:5000/api/quiz/get-questions/:quizId
// ශිෂ්‍යයා ප්‍රශ්න පත්‍රය කරන අවස්ථාවේදී ලබාගන්නා දත්ත
router.get('/get-questions/:quizId', checkQuizAccess, (req, res) => {
    const quizId = req.params.quizId;

    // මෙහිදී අපි correct_option හෝ explanations ලබාගන්නේ නැහැ 
    // (එවිට ශිෂ්‍යයාට inspect element කරලා උත්තර හොයන්න බැහැ)
    const sql = `
        SELECT id, question_text, option_a, option_b, option_c, option_d 
        FROM Questions 
        WHERE quiz_id = ?
    `;
    
    db.query(sql, [quizId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length === 0) {
            return res.status(404).json({ message: "No questions found for this quiz." });
        }
        
        res.json(results);
    });
});
*/
/*
// http://localhost:5000/api/quiz/get-questions/:quizId
router.get('/get-questions/:quizId', checkQuizAccess, (req, res) => {
    const quizId = req.params.quizId;

    // Quizzes table එකෙන් කාලය සහ Expire date එකත්, Questions table එකෙන් ප්‍රශ්නත් ලබා ගැනීම
    const sql = `
        SELECT 
            q.id AS quiz_id,
            q.expires_at,
            q.time_limit_minutes,
            que.id AS question_id,
            que.question_text,
            que.option_a,
            que.option_b,
            que.option_c,
            que.option_d
        FROM Quizzes q
        JOIN Questions que ON q.id = que.quiz_id
        WHERE q.id = ?
    `;
    
    db.query(sql, [quizId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length === 0) {
            return res.status(404).json({ message: "No questions found for this quiz." });
        }

        // Response එක වඩාත් පැහැදිලිව සකස් කිරීම
        const quizData = {
            quizId: results[0].quiz_id,
            expires_at: results[0].expires_at,
            time_limit_minutes: results[0].time_limit_minutes,
            questions: results.map(row => ({
                id: row.question_id,
                question_text: row.question_text,
                options: {
                    a: row.option_a,
                    b: row.option_b,
                    c: row.option_c,
                    d: row.option_d
                }
            }))
        };
        
        res.json(quizData);
    });
});
*/

/*
router.get('/get-questions/:quizId', checkQuizAccess, (req, res) => {
    const quizId = req.params.quizId;

    const sql = `
        SELECT 
            q.id AS quiz_id,
            que.id AS question_id,
            que.question_text,
            que.correct_option,  -- මේක අනිවාර්යයෙන්ම තියෙන්න ඕනේ
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
        
        const quizData = {
            quizId: results[0].quiz_id,
            questions: results.map(row => ({
                id: row.question_id,
                question_text: row.question_text,
                correct_option: row.correct_option, // මේක මෙතනටත් එකතු කරන්න
                options: {
                    a: row.option_a,
                    b: row.option_b,
                    c: row.option_c,
                    d: row.option_d
                },
                explanations: { // පහසුව සඳහා මෙහෙම එකතු කරන්නත් පුළුවන්
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
*/
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
        
        // පරීක්ෂාව: ප්‍රශ්න ලැබී නැතිනම් results[0] කියවීමට නොගොස් 404 response එකක් ලබා දේ
        if (!results || results.length === 0) {
            return res.status(404).json({ message: "No questions found for this quiz." });
        }

        const quizData = {
            quizId: results[0].quiz_id, // දැන් results[0] ඇති බව සහතික නිසා crash නොවේ
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
/*
//student submit quiz
//http://localhost:5000/api/submit-quiz
router.post('/submit-quiz', (req, res) => {
    const { studentId, quizId, answers } = req.body;

    //  check student did paymnt and approve it
    const checkPaymentSql = "SELECT * FROM Quiz_Payments WHERE student_id = ? AND quiz_id = ? AND status = 'Approved'";

    db.query(checkPaymentSql, [studentId, quizId], (paymentErr, paymentResults) => {
        if (paymentErr) return res.status(500).json({ error: paymentErr.message });

        // if not complete paymnt or Approve 
        if (paymentResults.length === 0) {
            return res.status(403).json({ 
                error: "Access Denied. You must pay and get admin approval before submitting this quiz." 
            });
        }

        // if successfyly complete and aprove paymnt
        const sql = "SELECT id, correct_option FROM Questions WHERE quiz_id = ?";
        
        db.query(sql, [quizId], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });

            let score = 0;
            const totalQuestions = results.length;

            // match answers
            results.forEach((q) => {
                const studentAns = answers.find(a => a.questionId === q.id);
                if (studentAns && studentAns.selected === q.correct_option) {
                    score++;
                }
            });

            // save result
            const saveSql = "INSERT INTO Quiz_Attempts (student_id, quiz_id, score, total_questions) VALUES (?, ?, ?, ?)";
            db.query(saveSql, [studentId, quizId, score, totalQuestions], (saveErr) => {
                if (saveErr) return res.status(500).json({ error: saveErr.message });
                
                res.json({ 
                    message: "Quiz submitted successfully!", 
                    score: score, 
                    total: totalQuestions 
                });
            });
        });
    });
});
*/



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

    // 1. Payment status එක කලින් වගේම check කරනවා
    const checkPaymentSql = "SELECT * FROM Quiz_Payments WHERE student_id = ? AND quiz_id = ? AND status = 'Approved'";

    db.query(checkPaymentSql, [studentId, quizId], (paymentErr, paymentResults) => {
        if (paymentErr) return res.status(500).json({ error: paymentErr.message });

        if (paymentResults.length === 0) {
            return res.status(403).json({ 
                error: "Access Denied. You must pay and get admin approval before submitting this quiz." 
            });
        }

        // 2. Database එකෙන් ප්‍රශ්න, නිවැරදි පිළිතුරු සහ විවරණ ලබා ගැනීම
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
            const reviewData = []; // ශිෂ්‍යයාට පසුව පෙන්වීමට විස්තර මෙහි තැන්පත් වේ

            // 3. ලකුණු ගණනය කිරීම සහ Review data සකස් කිරීම
            results.forEach((q) => {
                const studentAns = answers.find(a => a.questionId === q.id);
                const isCorrect = studentAns && studentAns.selected === q.correct_option;

                if (isCorrect) score++;

                // ශිෂ්‍යයාට පෙන්වන සම්පූර්ණ විස්තරය
                reviewData.push({
                    questionId: q.id,
                    question_text: q.question_text,
                    studentSelected: studentAns ? studentAns.selected : null,
                    correctOption: q.correct_option,
                    isCorrect: isCorrect,
                    // අදාළ විවරණය (Explanation) පමණක් තෝරා ගැනීම
                    explanation: q[`explanation_${q.correct_option.toLowerCase()}`] 
                });
            });

            // 4. ප්‍රතිඵලය Database එකේ Save කිරීම
            const saveSql = "INSERT INTO Quiz_Attempts (student_id, quiz_id, score, total_questions) VALUES (?, ?, ?, ?)";
            db.query(saveSql, [studentId, quizId, score, totalQuestions], (saveErr) => {
                if (saveErr) return res.status(500).json({ error: saveErr.message });
                
                // 5. අවසාන ප්‍රතිඵලය විවරණ සහිතව Frontend එකට යැවීම
                res.json({ 
                    message: "Quiz submitted successfully!", 
                    score: score, 
                    total: totalQuestions,
                    review: reviewData // මෙහි සියලුම විවරණ සහ නිවැරදි පිළිතුරු ඇත
                });
            });
        });
    });
});





module.exports = router;