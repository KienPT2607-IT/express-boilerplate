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
const categoryRouter = require("./routes/categories")
const productRouter = require("./routes/products")

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/uploads')));

app.use("/customers", customerRouter)
app.use("/staffs", staffRouter)
app.use("/categories", categoryRouter)
app.use("/products", productRouter)

module.exports = app;
