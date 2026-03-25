const express = require("express");
const router = express.Router();
const db = require('../index')



//http://localhost:5000/api/courses/science
// 1. Specific routes first
router.get("/science", (req, res) => {
    const sql = "SELECT * FROM courses WHERE category = 'Science'";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ message: "No courses found" });
        res.json(result);
    });
});



// http://localhost:5000/api/courses/mathematics
// Get all Mathematics courses
router.get("/mathematics", (req, res) => {
    const sql = "SELECT * FROM courses WHERE category = 'Mathematics'";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// http://localhost:5000/api/courses/technology
// Get all Technology courses
router.get("/technology", (req, res) => {
    const sql = "SELECT * FROM courses WHERE category = 'Technology'";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

//http://localhost:5000/api/courses/
//get all courses
router.get("/", (req,res) => {
    db.query("SELECT * FROM courses" , (err,result) => {
        if(err) 
            return res.status(500).json(err);
        res.json(result);
    });
});


//http://localhost:5000/api/courses/add
//Add Course
router.post("/add", (req,res) => {
    const { title, descriptions, price, category} = req.body;

    const sql = `
    INSERT INTO courses (course_code, title, descriptions, price, category)
    SELECT
    CONCAT(
    LEFT(?,1),
    LPAD(IFNULL(MAX(CAST(SUBSTRING(course_code,2)AS UNSIGNED)),0)+1,3, '0')
    ),
    ?,?,?,?
    FROM courses
    WHERE category = ?;
    `;

    db.query(
        sql,
        [category, title, descriptions, price, category, category],
        (err,result) => {
            if(err)
                return res.status(500).json(err);
            res.json({message: "Course Added Successfully"});
        }
    );
});

//get 1 course
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

//fetch by category, 
router.get("/category/:category" , (req,res) => {
    const {category} = req.params;

    const sql = "SELECT * FROM courses WHERE category =?";

    db.query(sql, [category], (err,result) => {
        if(err)
            return res.status(500).json(err);
        res.json(result);
    });
});


//fetcch by title
router.get("/title/:title" , (req,res) => {
    const {title} = req.params;

    const sql = "SELECT * FROM courses WHERE title LIKE ?";

    db.query(sql, [`%${title}%`], (err,result) => {
        if(err)
            return res.status(500).json(err);
        res.json(result);
    });
});


//delete course by course_code
router.delete("/delete/:course_code" , (req,res) => {
    const {course_code} = req.params;

    const sql = "DELETE FROM courses WHERE course_code = ?";

    db.query(sql, [course_code], (err,result) => {
        if(err)
            return res.status(500).json(err);
        if(result.affectedRows === 0){
            return res.status(404).json({message: " Course not found"});
        }

        res.json({message:"Course delete successfully"});
    });
});

// GET course + related content by course_code
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



// http://localhost:5000/api/courses/update/S001
// Edit/Update course details
router.put("/update/:course_code", (req, res) => {
    const { course_code } = req.params;
    const { title, descriptions, price, category } = req.body;

    // fields update කිරීම සඳහා SQL query එක
    const sql = `
        UPDATE courses 
        SET title = ?, descriptions = ?, price = ?, category = ? 
        WHERE course_code = ?
    `;

    db.query(
        sql, 
        [title, descriptions, price, category, course_code], 
        (err, result) => {
            if (err) {
                // සිරස්තල (Title) එක දැනටමත් තිබේ නම් එන Error එක පරීක්ෂාව
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "මෙම පාඨමාලා නාමය දැනටමත් පද්ධතියේ පවතී." });
                }
                return res.status(500).json(err);
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Course not found" });
            }

            res.json({ message: "Course updated successfully" });
        }
    );
});





module.exports = router;