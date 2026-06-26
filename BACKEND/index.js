//const mysql = require("mysql");
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  //password: 'Hirushi@890',
   password: process.env.DB_PASSWORD,
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


/* "type": "commonjs",
  "main": "index.js",*/
