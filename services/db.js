require("dotenv").config()
const mysql = require("mysql2")
const bcrypt = require('bcrypt');

const connection = mysql.createConnection({
   host: process.env.HOST,
   user: process.env.USER,
   password: process.env.PASSWORD,
   database: process.env.DATABASE
   // host: "localhost",
   // user: "root",
   // password: "root",
   // database: "mydb"
})

module.exports = connection.promise()