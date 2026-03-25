// middleware.js

const db = require("../index");

const checkUserStatus = (req, res, next) => {
    // ශිෂ්‍යයාගේ ID එක ලබා ගැනීම (මෙය බොහෝවිට req.body හෝ req.params හරහා ලැබෙනු ඇත)
    const studentId = req.body.studentId || req.query.studentId || req.params.studentId;

    if (!studentId) {
        return next(); // studentId නැතිනම් මීළඟ පියවරට යන්න (නැතහොත් error එකක් දෙන්න)
    }

    const sql = "SELECT status FROM students WHERE id = ?";
    db.query(sql, [studentId], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error during status check." });

        if (results.length > 0 && results[0].status === 'Deactive') {
            return res.status(403).json({ 
                error: "Access Denied. Your account has been deactivated by the admin. You cannot perform this action." 
            });
        }
        
        next(); // ශිෂ්‍යයා Active නම් පමණක් ඉදිරියට යාමට ඉඩ දෙන්න
    });
};

module.exports = { checkUserStatus };