require('dotenv').config(); // උඩින්ම මේක දාන්න
/*const mysql = require("mysql");

//const express = require("express"); // express import කරන්න
//app.use(express.urlencoded({ extended: true }));
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "students"
});

connection.connect(err => {
  if (err) {
    console.log("DB connection failed:", err);
  } else {
    console.log("MySQL connected");
  }
});

module.exports = connection;

/*
connection.query('select * from students' , (err,result,fields)=>{
    if(err){
        return console.log(err);
    }
    return console.log(result);
})
    */

const mysql = require("mysql2"); 
const fs = require("fs");
const path = require("path");

const connection = mysql.createConnection({
  host: "mysql-2e81e578-divyanjalie789-1021.i.aivencloud.com",
  port: 10760,
  user: "avnadmin",
  password: process.env.DB_PASSWORD,
  database: "defaultdb", 
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname,"uploads", "ca.pem")), // ca.pem file එක හරියටම මෙතන තියෙන්න ඕනේ
  },
});

connection.connect((err) => {
  if (err) {
    console.log("Cloud DB connection failed ❌:", err);
  } else {
    console.log("Cloud MySQL connected successfully! ✅");
  }
});

module.exports = connection;