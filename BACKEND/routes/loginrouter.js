const express = require("express");
const router = express.Router();
const db = require("../index");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer"); //for send email
const crypto = require("crypto");  //for create random otp

// login 
// http://localhost:5000/api/login/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. මුලින්ම Admin Table එක පරීක්ෂා කරමු
  const adminSql = "SELECT * FROM admins WHERE email = ?";
  
  db.query(adminSql, [email], async (err, adminResults) => {
    if (err) return res.status(500).json(err);

    if (adminResults.length > 0) {
      // Admin කෙනෙක් හමු වුණා
      const admin = adminResults[0];
      const match = await bcrypt.compare(password, admin.password);
      
      if (!match) return res.status(401).json({ message: "Incorrect password" });

      return res.json({
        message: "Admin Login successful",
        userID: admin.id,
        name: admin.full_name,
        role: "admin" // Frontend එකට මේක වැදගත්
      });
    }

    // 2. Admin කෙනෙක් නැත්නම් Student Table එක පරීක්ෂා කරමු
    const studentSql = "SELECT * FROM students WHERE email = ?";
    
    db.query(studentSql, [email], async (err, studentResults) => {
      if (err) return res.status(500).json(err);
      
      if (studentResults.length === 0) {
        return res.status(400).json({ message: "Email not found" });
      }

      const user = studentResults[0];

      // Verification එක බලමු (Admin ලාට verification ඕනේ නෑ කියලා හිතමු)
      if (!user.is_verified) {
        return res.status(401).json({ message: "Please verify your email first" });
      }

      // Password බලමු
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: "Incorrect password" });

      res.json({
        message: "Student Login successful",
        userID: user.id,
        name: user.full_name,
        role: "student" // Student role එක
      });
    });
  });
});

//http://localhost:5000/api/login/forgot-password
//fogot pw
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  const sql = "SELECT * FROM students WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(400).json({ message: "No student found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Save OTP in DB
    const updateSql = "UPDATE students SET forgot_otp = ?, forgot_otp_expiry = ? WHERE email = ?";
    db.query(updateSql, [otp, expiry, email], (err, result) => {
      if (err) return res.status(500).json(err);

      // Send email
      const mailOptions = {
        from: "your-email@gmail.com",
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP is ${otp}. It expires in 3 minutes.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) return res.status(500).json({ message: "Error sending OTP", error });
        res.json({ message: "OTP sent to your email" });
      });
    });
  });
});

//http://localhost:5000/api/login/verify-forgot-otp
//fogot otp verify
router.post("/verify-forgot-otp", (req, res) => {
  const { email, otp } = req.body;

  const sql = "SELECT forgot_otp, forgot_otp_expiry FROM students WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(400).json({ message: "No student found with this email" });

    const user = results[0];
    const now = new Date();

    if (user.forgot_otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (now > user.forgot_otp_expiry) return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified. You can now reset your password." });
  });
});

//http://localhost:5000/api/login/reset-password
//reset pw
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updateSql = `
    UPDATE students 
    SET password = ?, forgot_otp = NULL, forgot_otp_expiry = NULL 
    WHERE email = ?`;

  db.query(updateSql, [hashedPassword, email], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Password reset successfully" });
  });
});

module.exports = router;