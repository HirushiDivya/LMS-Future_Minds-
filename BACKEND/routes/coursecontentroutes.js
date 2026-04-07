const express = require("express");
const router = express.Router();
const db = require('../index');
const multer = require('multer');
const path = require('path');


// File save path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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
router.post("/add/:course_code", upload.single('file'), (req, res) => {
  const { course_code } = req.params; 
  const { content_type, title, external_link } = req.body;

  const finalLink = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : external_link;

  if (!content_type || !title) {
    return res.status(400).json({ message: "Type and Title are required" });
  }

  const sql = `INSERT INTO coursecontent (course_code, content_type, title, external_link) VALUES (?, ?, ?, ?)`;

  db.query(sql, [course_code, content_type, title, finalLink], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
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

    // 1. check paymnt ststs approve or pending
    const checkStatusSql = `
        SELECT payment_status 
        FROM enrollments 
        WHERE student_id = ? AND course_id = ?`;

    db.query(checkStatusSql, [student_id, course_id], (err, result) => {
        if (err) return res.status(500).json(err);

        // if not yet enroll 
        if (result.length === 0) {
            return res.status(403).json({ 
                access: false, 
                message: "You are not enrolled in this course." 
            });
        }

        const status = result[0].payment_status;

        // 2.if only sttus = approve can access ->content
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
        // 3. 'status = pending,reject can not access
        else {
            res.status(403).json({ 
                access: false, 
                message: `Your enrollment status is still ${status}. Admin approval is required to access the course.` 
            });
        }
    });   
});


module.exports = router;
