const express = require("express");
const router = express.Router();
const db = require('../index')
const multer = require('multer');
const path = require('path');

// --- Multer Configuration  ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
 
const upload = multer({ storage: storage });

// --- all course Count ---
// http://localhost:5000/api/courses/count-all
router.get("/count-all", (req, res) => {
    const sql = "SELECT COUNT(*) AS total_courses FROM courses";

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json(err);
        }

        res.json({
            total_courses: result[0].total_courses
        });
    });
});


//http://localhost:5000/api/courses/
//1. get all courses
router.get("/", (req,res) => {
    db.query("SELECT * FROM courses" , (err,result) => {
        if(err) 
            return res.status(500).json(err);
        res.json(result);
    });
});

//http://localhost:5000/api/courses/science
// 2. science courses
router.get("/science", (req, res) => {
    const sql = "SELECT * FROM courses WHERE category = 'Science'";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ message: "No courses found" });
        res.json(result);
    });
});



// http://localhost:5000/api/content/average-progress/:studentId
router.get("/average-progress/:studentId", (req, res) => {
    const { studentId } = req.params;

    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM coursecontent cc
             JOIN enrollments e ON cc.course_code = e.course_id
             WHERE e.student_id = ? AND e.payment_status = 'Approved') AS total_content,
            
            (SELECT COUNT(*) FROM content_progress cp
             WHERE cp.student_id = ? AND cp.status = 'Completed') AS completed_count
    `;

    db.query(sql, [studentId, studentId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const total = result[0].total_content || 0;
        const completed = result[0].completed_count || 0;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        res.json({ average_percentage: percentage });
    });
});
 
// http://localhost:5000/api/courses/student-enrolled-count/:studentId
// student - enrolled all courses count (Approved පමණි)
router.get("/student-enrolled-count/:studentId", (req, res) => {
    const studentId = req.params.studentId;

    const sql = `
        SELECT COUNT(*) AS enrolled_courses_count 
        FROM enrollments 
        WHERE student_id = ? AND payment_status = 'Approved'
    `;

    db.query(sql, [studentId], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.json({
            student_id: studentId,
            enrolled_courses_count: result[0].enrolled_courses_count || 0
        });
    });
});

// http://localhost:5000/api/courses/mathematics
// 3.Get all Mathematics courses
router.get("/mathematics", (req, res) => {
    const sql = "SELECT * FROM courses WHERE category = 'Mathematics'";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// http://localhost:5000/api/courses/technology
// 4.Get all Technology courses
router.get("/technology", (req, res) => {
    const sql = "SELECT * FROM courses WHERE category = 'Technology'";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

//5
router.post("/add", upload.single('course_img'), (req, res) => {
    const { title, descriptions, price, category, image_url } = req.body;
    
    let final_img = 'default-image.jpg';

    if (req.file) {
        final_img = req.file.filename; 
    } else if (image_url) {
        final_img = image_url; 
    }

    const sql = `
    INSERT INTO courses (course_code, title, descriptions, price, category, course_img)
    VALUES (
        (SELECT CONCAT(LEFT(?, 1), LPAD(IFNULL(MAX(CAST(SUBSTRING(course_code, 2) AS UNSIGNED)), 0) + 1, 3, '0')) 
         FROM courses as temp WHERE category = ?),
        ?, ?, ?, ?, ?
    );
    `;

    db.query(sql, [category, category, title, descriptions, price, category, final_img], (err, result) => {
        if (err) {
            console.error("Database Error:", err); // Error - console 
            return res.status(500).json(err);
        }
        res.json({ message: "Course Added Successfully", fileName: final_img });
    });
});


// 6 get 1 course
router.get("/:course_code" , (req,res) =>{
    const {course_code} = req.params;

    const sql = "SELECT * FROM courses WHERE course_code = ? ";

    db.query(sql, [course_code], (err,result) => {
        if(err)
            return res.status(500).json(err);
        if(result.length === 0)
            return res.status(404).json({message: "course no found"});

        res.json(result[0]);
    });
});

// 7. fetch by category, 
router.get("/category/:category" , (req,res) => {
    const {category} = req.params;

    const sql = "SELECT * FROM courses WHERE category =?";

    db.query(sql, [category], (err,result) => {
        if(err)
            return res.status(500).json(err);
        res.json(result);
    });
});


//8. fetcch by title
router.get("/title/:title" , (req,res) => {
    const {title} = req.params;

    const sql = "SELECT * FROM courses WHERE title LIKE ?";

    db.query(sql, [`%${title}%`], (err,result) => {
        if(err)
            return res.status(500).json(err);
        res.json(result);
    });
});


//9. delete course by course_code
router.delete("/delete/:course_code", (req, res) => {
  const { course_code } = req.params;

  const getCourseId = "SELECT id FROM courses WHERE course_code = ?";

  db.query(getCourseId, [course_code], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ message: "Course not found" });

    const courseId = result[0].id;

    const deleteEnrollments = "DELETE FROM enrollments WHERE course_id = ?";
    
    db.query(deleteEnrollments, [courseId], (err) => {
      if (err) return res.status(500).json(err);

      const deleteSql = "DELETE FROM courses WHERE id = ?";
      db.query(deleteSql, [courseId], (err, finalResult) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Course and all related enrollments deleted successfully!" });
      });
    });
  });
});

//10. GET course + related content by course_code
router.get("/course/:course_code", (req, res) => {
  const { course_code } = req.params;

  const sql = `
    SELECT 
      c.course_code,
      c.title AS course_title,
      c.descriptions,
      c.price,
      c.category,
      cc.id AS content_id,
      cc.content_type,
      cc.title AS content_title,
      cc.external_link
    FROM courses c
    LEFT JOIN coursecontent cc
    ON c.course_code = cc.course_code
    WHERE c.course_code = ?
  `;

  db.query(sql, [course_code], (err, result) => {
    if (err) return res.status(500).json(err);

    // Optional: group course content into an array
    if (result.length === 0) return res.status(404).json({ message: "Course not found" });

    const course = {
      course_code: result[0].course_code,
      title: result[0].course_title,
      descriptions: result[0].descriptions,
      price: result[0].price,
      category: result[0].category,
      contents: result.map(r => r.content_id ? {
        id: r.content_id,
        type: r.content_type,
        title: r.content_title,
        link: r.external_link
      } : null).filter(Boolean)
    };

    res.json(course);
  });
});

router.put("/update/:course_code", upload.single('course_img'), (req, res) => {
    const { course_code } = req.params;
    const { title, descriptions, price, category, image_url, course_img } = req.body;

    let final_img = "";

    if (req.file) {
        final_img = req.file.filename;
    } else if (image_url && image_url.startsWith('http')) {
        final_img = image_url;
    } else {
        final_img = course_img;
    }

    const sql = `UPDATE courses SET title=?, descriptions=?, price=?, category=?, course_img=? WHERE course_code=?`;

    db.query(sql, [title, descriptions, price, category, final_img, course_code], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Updated", fileName: final_img });
    });
});



// http://localhost:5000/api/courses/count-students/1
// all students -course -(Pending + Approved)
router.get("/count-students/:course_id", (req, res) => {
    const { course_id } = req.params;

    const sql = `
        SELECT COUNT(enrollment_id) AS total_enrolled 
        FROM enrollments 
        WHERE course_id = ? 
        AND (payment_status = 'Pending' OR payment_status = 'Approved')
    `;

    db.query(sql, [course_id], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json(err);
        }

        res.json({
            course_id: course_id,
            total_enrolled: result[0].total_enrolled
        });
    });
});

// http://localhost:5000/api/courses/update-progress
router.post("/update-progress", (req, res) => {
    const { studentId, contentId, status } = req.body;
    
    // Progress  update  (Insert or Update on Duplicate)
    const sql = `
        INSERT INTO content_progress (student_id, content_id, status) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE status = VALUES(status), completed_at = CURRENT_TIMESTAMP
    `;

    db.query(sql, [studentId, contentId, status], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Progress updated" });
    });
});


// http://localhost:5000/api/content/average-progress/:studentId
router.get("/average-progress/:studentId", (req, res) => {
    const { studentId } = req.params;

    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM coursecontent cc
             JOIN enrollments e ON cc.course_code = e.course_id
             WHERE e.student_id = ? AND e.payment_status = 'Approved') AS total_content,
            
            (SELECT COUNT(*) FROM content_progress cp
             WHERE cp.student_id = ? AND cp.status = 'Completed') AS completed_count
    `;

    db.query(sql, [studentId, studentId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const total = result[0].total_content || 0;
        const completed = result[0].completed_count || 0;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        res.json({ average_percentage: percentage });
    });
});
module.exports = router;