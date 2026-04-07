/*
const nodemailer = require('nodemailer');
const express = require("express"); 
const router = express.Router();    

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
*/