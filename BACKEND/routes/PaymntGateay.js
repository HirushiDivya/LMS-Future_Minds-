const express = require("express");
require("dotenv").config(); 
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // .env - Secret Key 
const router = express.Router();
const db = require("../index");

const PDFDocument = require("pdfkit");
console.log("Stripe Key Check:", process.env.STRIPE_SECRET_KEY);
// 1. Stripe Checkout Session 

router.post("/create-checkout-session", async (req, res) => {
  const { student_id, quiz_id, course_id, amount } = req.body;

  try {
    let sql, params;
    if (quiz_id) {
      sql = `INSERT INTO Quiz_Payments (student_id, quiz_id, amount, status, payment_method) VALUES (?, ?, ?, 'Pending', 'Online')`;
      params = [student_id, quiz_id, amount];
    } else if (course_id) {
      sql = `INSERT INTO Course_Payments (student_id, course_id, amount, status, payment_method) VALUES (?, ?, ?, 'Pending', 'Online')`;
      params = [student_id, course_id, amount];
    } else {
      return res.status(400).json({ error: "No valid payment target" });
    }

    db.query(sql, params, async (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      const order_id = result.insertId;

      // Stripe Checkout Session 
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "lkr",
              product_data: {
                name: course_id ? "LMS Course Payment" : "LMS Quiz Payment",
                metadata: { order_id: order_id.toString() }, 
              },
              unit_amount: Math.round(amount * 100), // LKR
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        //  if success -> order_id -> Success page 
        success_url: `http://localhost:3000/success?order_id=${order_id}&type=${course_id ? "course" : "quiz"}`,
        cancel_url: "http://localhost:3000/cancel",
      });

      res.json({ url: session.url, order_id: order_id });
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


router.post("/confirm-payment", (req, res) => {
  const { order_id, type, invoice_number } = req.body;

  if (type === "course") {
    db.query("SELECT * FROM Course_Payments WHERE id = ?", [order_id], (err, rows) => {
      if (err || rows.length === 0) return res.status(404).json({ error: "Not found" });
      const payment = rows[0];

      db.query("UPDATE Course_Payments SET status='Approved' WHERE id=?", [order_id], (err) => {
        if (err) return res.sendStatus(500);

        const enrollSql = "INSERT IGNORE INTO enrollments (student_id, course_id, payment_status, payment_method, invoice_number) VALUES (?, ?, ?, ?, ?)";
        db.query(enrollSql, [payment.student_id, payment.course_id, 'Approved', 'Online', invoice_number], (err) => {
          if (err) console.log("❌ Course Enroll Error:", err);
          res.json({ message: "Course Payment Approved & Enrolled!" });
        });
      });
    });
  } else {
    db.query("SELECT * FROM Quiz_Payments WHERE id = ?", [order_id], (err, rows) => {
      if (err || rows.length === 0) return res.status(404).json({ error: "Not found" });
      const payment = rows[0];

      db.query("UPDATE Quiz_Payments SET status='Approved' WHERE id=?", [order_id], (err) => {
        if (err) return res.sendStatus(500);

        const quizEnrollSql = `
          INSERT IGNORE INTO Quiz_Enrollments (student_id, quiz_id, payment_status, payment_method, invoice_number) 
          VALUES (?, ?, ?, ?, ?)
        `;

        db.query(quizEnrollSql, [payment.student_id, payment.quiz_id, 'Approved', 'Online', invoice_number], (err) => {
          if (err) {
            console.log("❌ Quiz Enroll Error:", err);
            return res.status(500).json({ error: "Quiz Enrollment failed" });
          }
          res.json({ message: "Quiz Payment Approved & Access Granted!" });
        });
      });
    });
  }
});






router.get("/generate-invoice/:payment_id", (req, res) => {
  const paymentId = req.params.payment_id;
  const type = req.query.type;

  let sql = "";
  if (type === "course") {
    sql = `
      SELECT p.*, c.title as item_name 
      FROM Course_Payments p 
      LEFT JOIN courses c ON p.course_id = c.id 
      WHERE p.id = ?`;
  } else {
    sql = `
      SELECT p.*, q.title as item_name 
      FROM Quiz_Payments p 
      LEFT JOIN Quizzes q ON p.quiz_id = q.id 
      WHERE p.id = ?`;
  }

  db.query(sql, [paymentId], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).send("Payment record not found");

    const payment = results[0];
    const doc = new PDFDocument({ margin: 50 });
    const filename = `Invoice_${paymentId}.pdf`;

    res.setHeader("Content-disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-type", "application/pdf");

    doc.pipe(res);

    // --- Header Section ---
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("FUTURE MINDS INSTITUTE", 50, 50);
    doc.fontSize(10).text("123, Education Lane, Colombo, Sri Lanka", 50, 75);
    doc.text("Phone: +94 112 345 678 | Email: info@futureminds.lk", 50, 90);

    doc
      .fontSize(25)
      .fillColor("#28a745")
      .text("OFFICIAL RECEIPT", 0, 50, { align: "right" });
    doc.moveDown();

    doc.moveTo(50, 115).lineTo(550, 115).strokeColor("#cccccc").stroke();

    const now = new Date();
    const formattedDate = now.toLocaleDateString();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    doc
      .fillColor("#000000")
      .fontSize(10)
      .text(`Invoice No: #INV-${payment.id.toString().padStart(5, "0")}`, 50, 130)
      .text(`Issued Date: ${formattedDate}`, 50, 145)
      .text(`Issued Time: ${formattedTime}`, 50, 160);

    doc.text(`Student ID: ${payment.student_id}`, 400, 130, { align: "right" });

    // --- Status Dynamic Section (Pending/Approved) ---
    const currentStatus = payment.status ? payment.status.toUpperCase() : "PENDING";
    const statusColor = currentStatus === "APPROVED" ? "#28a745" : "#f39c12"; // Approved green, Pending ornge

    doc
      .fillColor(statusColor)
      .font("Helvetica-Bold")
      .text(`Status: ${currentStatus}`, 400, 145, { align: "right" });

    doc.moveDown(4);

    // --- Table Header ---
    const tableTop = 200;
    doc.rect(50, tableTop, 500, 25).fill("#f2f2f2");
    doc
      .fillColor("#333")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Description", 60, tableTop + 7)
      .text("Name", 200, tableTop + 7)
      .text("Method", 380, tableTop + 7)
      .text("Amount (LKR)", 480, tableTop + 7, { width: 60, align: "right" });

    // --- Table Content ---
    doc
      .font("Helvetica")
      .fillColor("#000")
      .fontSize(10)
      .text(type === "course" ? "Course Fee" : "Quiz Fee", 60, tableTop + 35)
      .text(payment.item_name || "N/A", 200, tableTop + 35)
      .text(payment.payment_method || "N/A", 380, tableTop + 35)
      .text(
        `LKR ${parseFloat(payment.amount).toLocaleString()}`,
        480,
        tableTop + 35,
        { width: 60, align: "right" }
      );

    doc
      .moveTo(50, tableTop + 55)
      .lineTo(550, tableTop + 55)
      .strokeColor("#eeeeee")
      .stroke();

    // --- Total Section ---
    doc.moveDown(3);
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(`TOTAL PAID: LKR ${parseFloat(payment.amount).toLocaleString()}`, {
        align: "right",
      });

    // --- Pending Payment Note ---
    if (currentStatus === "PENDING") {
      doc
        .fontSize(10)
        .fillColor("#e74c3c")
        .text(
          "Note: This payment is awaiting manual verification. Access will be granted shortly.",
          50,
          tableTop + 100,
          { align: "left" }
        );
    }

    // --- Footer ---
    const footerTop = 700;
    doc
      .moveTo(50, footerTop)
      .lineTo(550, footerTop)
      .strokeColor("#cccccc")
      .stroke();
    doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .fillColor("#777")
      .text(
        "This is an electronically generated receipt and requires no signature.",
        50,
        footerTop + 10,
        { align: "center" }
      )
      .text(
        "Thank you for choosing Future Minds Institute.",
        50,
        footerTop + 25,
        { align: "center" }
      );

    doc.end();
  });
});
module.exports = router;
