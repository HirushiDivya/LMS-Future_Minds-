const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'mysql-2e81e578-divyanjalie789-1021.i.aivencloud.com',
  port: 10760,
  user: 'avnadmin',
  password: 'AVNS_zRY-hBim_pSn1krmwF8',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: false // Aiven සඳහා මෙය අනිවාර්යයි
  }
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected to Aiven MySQL successfully!');
});


/*const mysql = require("mysql");


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
*/