const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const routes = require('./routes/router');
const app = express();

// Middleware for file uploads
app.use(fileUpload());

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "uploads" directory
app.use('/uploads', express.static('uploads'));

// Set view engine to EJS
app.set('view engine', 'ejs');

// Use routes
app.use('/', routes);

// Start the server
app.listen(4000, () => {
    console.log('Server running at http://localhost:4000');
});
