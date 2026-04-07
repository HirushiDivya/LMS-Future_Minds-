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

const sendOTPMail = async (userEmail, userName, otpCode) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "shadosilva4@gmail.com",
      pass: "rser jzyg crva vzvq", 
    },
  });

  const mailOptions = {
    from: '"FutureMinds Education" <shadosilva4@gmail.com>', // Sender නම මෙතන දාන්න
    to: userEmail,
    subject: "Verify Your Account - OTP Code",
    // මෙන්න මෙතන තමයි අලුත් design එක හදන්නේ
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #6c63ff 0%, #ff6584 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Confirm Your Identity</h1>
        </div>

        <div style="padding: 30px; background-color: #ffffff; color: #333;">
          <p style="font-size: 16px; line-height: 1.6;">Hi <strong>${userName}</strong>,</p>
          <p style="font-size: 14px; color: #64748b;">Thank you for choosing LearnEase. Use the following One-Time Password (OTP) to complete your verification process. This code is valid for 10 minutes.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 15px 40px; background: #f1f5f9; border: 2px dashed #6c63ff; border-radius: 12px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${otpCode}</span>
            </div>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you didn't request this, please ignore this email or contact support.</p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b; margin: 0;">&copy; 2026 LearnEase Inc. All Rights Reserved.</p>
          <div style="margin-top: 10px;">
            <a href="#" style="color: #6c63ff; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
            <a href="#" style="color: #6c63ff; text-decoration: none; font-size: 12px; margin: 0 10px;">Support</a>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Professional OTP Email Sent!");
  } catch (error) {
    console.error("Email Error: ", error);
  }
};


/*
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
*/

router.post("/register", async (req, res) => {
  try {
    const { full_name, email, mobile, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP and expiry in 3 min
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 3 * 60 * 1000); 

    // Insert into DB
    const sql = "INSERT INTO students (full_name, email, mobile, password, otp, otp_expiry) VALUES (?, ?, ?, ?, ?, ?)";
    
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

        // --- මෙතැන් සිට වෙනස සිදු වේ ---
        try {
          // ඔබ කලින් හදාගත් ලස්සන HTML Mail function එක මෙතැනදී call කරයි
          await sendOTPMail(email, full_name, otp);
          
          res.json({
            message: "OTP sent to your email. Please verify to activate account",
            studentID: result.insertId,
          });
        } catch (mailError) {
          console.error("Mail Error:", mailError);
          // Email එක යැවීමේදී error එකක් ආවත් student record එක වැටිලා තියෙන්නේ. 
          // නමුත් පරිශීලකයාට දැනුම් දීම වැදගත්.
          res.status(500).json({ message: "Error sending OTP email", error: mailError });
        }
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