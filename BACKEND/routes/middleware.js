// middleware.js

const db = require("../index");

const checkUserStatus = (req, res, next) => {
    const studentId = req.body.studentId || req.query.studentId || req.params.studentId;

    if (!studentId) {
        return next(); 
    }

    const sql = "SELECT status FROM students WHERE id = ?";
    db.query(sql, [studentId], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error during status check." });

        if (results.length > 0 && results[0].status === 'Deactive') {
            return res.status(403).json({ 
                error: "Access Denied. Your account has been deactivated by the admin. You cannot perform this action." 
            });
        }
        
        next(); 
    });
};

module.exports = { checkUserStatus };