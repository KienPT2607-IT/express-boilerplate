const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require("dotenv").config()

const swaggerDefinition = {
   openapi: '3.0.0',
   info: {
      title: 'Your API Title',
      version: '1.0.0',
      description: 'Your API description',
   },
   apis: ["./routes/**/*.js"]
   // servers: [
   //    {
   //       url: process.env.SERVER_URL, // Change this to your server's URL
   //    },
   // ],
};

const options = {
   swaggerDefinition,
   // Paths to files containing OpenAPI definitions
   apis: ['./routes/*.js'], // Adjust the path as needed
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsDoc(options);

module.exports = {
   swaggerUi,
   swaggerSpec,
};