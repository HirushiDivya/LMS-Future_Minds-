const nodemailer = require('nodemailer');
const express = require("express"); // 1. express මුලින්ම ගේන්න
const router = express.Router();    // 2. router එක නිර්වචනය කරන්න

const sendInvoice = (studentEmail, amount, quizTitle) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'your-email@gmail.com', pass: 'your-app-password' }
    });

    let mailOptions = {
        from: 'LMS Education',
        to: studentEmail,
        subject: 'Payment Receipt',
        text: `You have successfully paid ${amount} for ${quizTitle}. Access granted!`
    };

    transporter.sendMail(mailOptions);
};


module.exports = router;