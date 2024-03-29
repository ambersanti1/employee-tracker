const mysql = require("mysql2");

require("dotenv").config();

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: process.env.MYSQL_PASSWORD,
  database: "employee_tracker",
});

module.exports = connection;
