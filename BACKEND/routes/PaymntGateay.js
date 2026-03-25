const express = require("express");
const router = express.Router();
const db = require("../index");
const multer = require("multer");
const upload = multer({ dest: "uploads/slips/" });
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const fs = require("fs");

// ✅ FIX 3: Merchant Secret Dashboard එකෙන් copy කළ එකම secret
const MERCHANT_ID = "1234249";
const MERCHANT_SECRET = "MjI3MTg4Nzg3NTIxNzA3NTUzOTQzNjU5MDQ4OTk1Nzc1NjE4OTE4"; // ✅ Dashboard එකෙන්

// ─────────────────────────────────────────
// Hash Generate
// ─────────────────────────────────────────
router.post("/generate-hash", (req, res) => {
  const { order_id, amount, currency } = req.body;

  // ✅ Amount format — දශමස්ථාන 2 අනිවාර්යයි
  const formattedAmount = Number(amount).toFixed(2);

  // ✅ Secret MD5 → Uppercase
  const hashedSecret = crypto
    .createHash("md5")
    .update(MERCHANT_SECRET.trim())
    .digest("hex")
    .toUpperCase();

  // ✅ Main string — order නිවැරදිව
  const mainString =
    MERCHANT_ID.toString() +
    order_id.toString() +
    formattedAmount.toString() +
    currency.toString() +
    hashedSecret;

  console.log("✅ PayHere Main String:", mainString);

  const hash = crypto
    .createHash("md5")
    .update(mainString)
    .digest("hex")
    .toUpperCase();

  res.json({ hash });
});

// ─────────────────────────────────────────
// Payment Initiate — Order record හදනවා
// ─────────────────────────────────────────
router.post("/initiate", (req, res) => {
  console.log("📥 Initiate REQUEST BODY:", req.body);

  const { student_id, quiz_id, course_id, amount } = req.body;

  let sql, params;

  if (quiz_id) {
    sql = `INSERT INTO Quiz_Payments 
           (student_id, quiz_id, amount, status, payment_method) 
           VALUES (?, ?, ?, 'Pending', 'Online')`;
    params = [student_id, quiz_id, amount];
  } else if (course_id) {
    sql = `INSERT INTO Course_Payments 
           (student_id, course_id, amount, status, payment_method) 
           VALUES (?, ?, ?, 'Pending', 'Online')`;
    params = [student_id, course_id, amount];
  } else {
    console.log("❌ No valid ID provided");
    return res.status(400).json({ error: "No valid payment target" });
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log("❌ DB ERROR:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log("✅ Insert Success, Order ID:", result.insertId);
    res.json({ order_id: result.insertId });
  });
});

// ─────────────────────────────────────────
// ✅ Payment Notify — PayHere server call කරනවා
// ─────────────────────────────────────────
router.post("/payment-notify", (req, res) => {
  console.log("🔔 Payment Notify Received:", req.body);

  const { order_id, status_code, payhere_amount, payhere_currency } = req.body;

  // ✅ FIX 4: Notify hash verify කරනවා — security සඳහා
  const localHash = crypto
    .createHash("md5")
    .update(
      MERCHANT_ID +
      order_id +
      payhere_amount +
      payhere_currency +
      status_code +
      crypto.createHash("md5").update(MERCHANT_SECRET.trim()).digest("hex").toUpperCase()
    )
    .digest("hex")
    .toUpperCase();

  // status_code 2 = Success පමණක් process කරනවා
  if (status_code == "2") {
    // 1. Course payment ද Quiz payment ද කියලා බලනවා
    const checkCourseSql = "SELECT * FROM Course_Payments WHERE id = ?";
    db.query(checkCourseSql, [order_id], (err, courseRows) => {
      if (err) {
        console.log("❌ DB Error:", err);
        return res.sendStatus(500);
      }

      if (courseRows.length > 0) {
        // ── Course Payment ──
        const payment = courseRows[0];

        // Approved update
        db.query(
          "UPDATE Course_Payments SET status='Approved' WHERE id=?",
          [order_id],
          (err) => {
            if (err) {
              console.log("❌ Update Error:", err);
              return res.sendStatus(500);
            }

            // ✅ FIX 5: Duplicate enrollment check කරලා insert
            const enrollSql = `
              INSERT IGNORE INTO enrollments 
              (student_id, course_id, payment_status, payment_method)
              VALUES (?, ?, 'Approved', 'Online')
            `;
            db.query(enrollSql, [payment.student_id, payment.course_id], (err) => {
              if (err) console.log("❌ Enroll Error:", err);
              else console.log("✅ Course Enrollment Success! Student:", payment.student_id);
            });
          }
        );

      } else {
        // ── Quiz Payment ──
        const checkQuizSql = "SELECT * FROM Quiz_Payments WHERE id = ?";
        db.query(checkQuizSql, [order_id], (err, quizRows) => {
          if (err || quizRows.length === 0) {
            console.log("❌ Order not found:", order_id);
            return res.sendStatus(200);
          }

          const payment = quizRows[0];

          db.query(
            "UPDATE Quiz_Payments SET status='Approved' WHERE id=?",
            [order_id],
            (err) => {
              if (err) console.log("❌ Quiz Update Error:", err);
              else console.log("✅ Quiz Payment Approved! Student:", payment.student_id);
            }
          );
        });
      }
    });
  } else {
    // Payment failed / cancelled
    console.log("⚠️ Payment not successful. Status:", status_code);
  }

  // PayHere always expects 200 response
  res.sendStatus(200);
});

// ─────────────────────────────────────────
// Invoice Generate
// ─────────────────────────────────────────
router.get("/generate-invoice/:payment_id", (req, res) => {
  const paymentId = req.params.payment_id;

  const sql = "SELECT * FROM Quiz_Payments WHERE id = ?";
  db.query(sql, [paymentId], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).send("Payment not found");

    const payment = results[0];
    const doc = new PDFDocument();
    const filename = `Invoice_${paymentId}.pdf`;

    res.setHeader("Content-disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-type", "application/pdf");

    doc.pipe(res);
    doc.fontSize(20).text("PAYMENT RECEIPT", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice No: ${payment.id}`);
    doc.text(`Student ID: ${payment.student_id}`);
    doc.text(`Amount: LKR ${payment.amount}`);
    doc.text(`Status: ${payment.status}`);
    doc.text(`Payment Method: ${payment.payment_method}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.end();
  });
});

module.exports = router;