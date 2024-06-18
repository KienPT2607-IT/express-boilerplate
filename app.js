require("dotenv").config()
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

const { swaggerUi, swaggerSpec } = require('./swagger');

var app = express();

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const customerRouter = require("./routes/customers")
const staffRouter = require("./routes/staffs")

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/customers", customerRouter)
app.use("/staffs", staffRouter)

module.exports = app;
