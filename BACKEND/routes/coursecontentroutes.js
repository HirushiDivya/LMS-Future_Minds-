const express = require("express");
const router = express.Router();
const db = require('../index');

//http://localhost:5000/api/content/course/S001
//get all content usig course_code
// GET all content for a course by course_code
router.get("/course/:course_code", (req, res) => {
  const { course_code } = req.params;

  const sql = `
    SELECT id, content_type, title, external_link
    FROM coursecontent
    WHERE course_code = ?
  `;

  db.query(sql, [course_code], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(404).json({ message: "No content found for this course" });
    }

    res.json(result);
  });
});


//http://localhost:5000/api/content/add
// http://localhost:5000/api/content/add/:course_code
// Add new content for a specific course
router.post("/add/:course_code", (req, res) => {
  // URL එකෙන් course_code එක ගන්නවා
  const { course_code } = req.params; 
  // Body එකෙන් අනිත් දත්ත ටික ගන්නවා
  const { content_type, title, external_link } = req.body;

  // Validation (දැන් body එකේ course_code අවශ්‍ය නැහැ, මොකද ඒක URL එකේ තියෙන නිසා)
  if (!content_type || !title) {
    return res.status(400).json({ message: "content_type and title are required" });
  }

  const sql = `
    INSERT INTO coursecontent (course_code, content_type, title, external_link)
    VALUES (?, ?, ?, ?)
  `;

db.query(sql, [course_code, content_type, title, external_link || null], (err, result) => {
    if (err) {
        console.error("Database Error:", err); // සර්වර් එකේ ලොග් එක බලන්න
        return res.status(500).json({ error: err.message }); // Error එක හරියටම පෝස්ට්මන් එකට යවන්න
    }
    res.json({ message: "Success", contentId: result.insertId });
});
});

//http://localhost:5000/api/content/update/1
//edit course content
// PUT update course content by content ID
router.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { content_type, title, external_link } = req.body;

  // Basic validation
  if (!content_type && !title && !external_link) {
    return res.status(400).json({ message: "Provide at least one field to update" });
  }

  const fields = [];
  const values = [];

  if (content_type) {
    fields.push("content_type = ?");
    values.push(content_type);
  }
  if (title) {
    fields.push("title = ?");
    values.push(title);
  }
  if (external_link) {
    fields.push("external_link = ?");
    values.push(external_link);
  }

  values.push(id); // last value for WHERE clause

  const sql = `UPDATE coursecontent SET ${fields.join(", ")} WHERE id = ?`;

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Content not found" });
    }

    res.json({ message: "Course content updated successfully" });
  });
});



//http://localhost:5000/api/content/delete/1
//delete course content
// DELETE content by content ID
router.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM coursecontent WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Content not found" });
    }

    res.json({ message: "Content deleted successfully" });
  });
});



//http://localhost:5000/api/content/1/1
//student enroll for course after admin approved
router.get("/:student_id/:course_id", (req, res) => {
    const { course_id, student_id } = req.params;

    // 1. මුලින්ම පරීක්ෂා කරනවා මේ ශිෂ්‍යයා අදාළ Course එකට Approved ද කියලා
    const checkStatusSql = `
        SELECT payment_status 
        FROM enrollments 
        WHERE student_id = ? AND course_id = ?`;

    db.query(checkStatusSql, [student_id, course_id], (err, result) => {
        if (err) return res.status(500).json(err);

        // Enrollment එකක් නැත්නම්
        if (result.length === 0) {
            return res.status(403).json({ 
                access: false, 
                message: "ඔබ මෙම පාඨමාලාවට ලියාපදිංචි වී නැත." 
            });
        }

        const status = result[0].payment_status;

        // 2. Status එක 'Approved' නම් පමණක් Content එක ලබා දෙනවා
        if (status === 'Approved') {
            const contentSql = "SELECT * FROM coursecontent WHERE id = ?";
            
            db.query(contentSql, [course_id], (err, content) => {
                if (err) return res.status(500).json(err);
                res.json({ 
                    access: true, 
                    data: content 
                });
            });
        } 
        // 3. 'Pending' හෝ 'Rejected' නම් Content එක දෙන්නේ නැහැ
        else {
            res.status(403).json({ 
                access: false, 
                message: `ඔබේ ලියාපදිංචිය තවමත් ${status} මට්ටමේ පවතී. පාඨමාලාවට ඇතුළු වීමට Admin අනුමැතිය අවශ්‍යයි.` 
            });
        }
    });
});


module.exports = router;
