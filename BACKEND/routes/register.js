const express = require("express");
const router = express.Router();
const db = require("../index");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer"); //for send email
const crypto = require("crypto");  //for create random otp


//http://localhost:5000/api/register/register
//register new student
//generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
//nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail", 
  auth: {
    user: "shadosilva4@gmail.com",
    pass: "rser jzyg crva vzvq", // app password 
  },
});

router.post("/register", async (req, res) => {
  try {
    const { full_name, email, mobile, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP and expiry in 3 min
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 3 * 60 * 1000); 

    // Insert into DB
    const sql =
      "INSERT INTO students (full_name,email,mobile,password,otp,otp_expiry) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(
      sql,
      [full_name, email, mobile, hashedPassword, otp, otpExpiry],
      async (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Email already exists" });
          }
          return res.status(500).json(err);
        }

        // Send OTP email
        const mailOptions = {
          from: "your-email@gmail.com",
          to: email,
          subject: "Verify your email",
          text: `Your OTP is ${otp}. It expires in 3 minutes.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).json({ message: "Error sending OTP", error });
          } else {
            res.json({
              message: "OTP sent to your email. Please verify to activate account",
              studentID: result.insertId,
            });
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


//http://localhost:5000/api/register/verify-otp
//otp verify
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  const sql = "SELECT otp, otp_expiry, is_verified FROM students WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json(err);

    // Record eka delete wela nam (Event eka nisa)
    if (results.length === 0) {
      return res.status(400).json({ message: "Registration expired or email not found. Please register again." });
    }

    const user = results[0];
    const now = new Date();

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Database eken delete wenna poddak kalin user try kaloth expire kiyala pennanna
    if (now > new Date(user.otp_expiry)) {
      return res.status(400).json({ message: "OTP expired. Please register again." });
    }

    const updateSql = "UPDATE students SET is_verified = TRUE, otp = NULL, otp_expiry = NULL WHERE email = ?";
    db.query(updateSql, [email], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Email verified successfully. Account activated!" });
    });
  });
});



module.exports = router;