require("dotenv").config()
const mysql = require("mysql2")
const bcrypt = require('bcrypt');

const connection = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "your_root_password",
   database: "mydb"
})

module.exports = connection.promise()