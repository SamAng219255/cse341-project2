/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/");
const swaggerRoute = require("./routes/swagger");

/* ***********************
 * Middleware
 * ************************/

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// CORS middleware
app.use(cors());

// Routes
app.use(apiRoutes);
app.use(swaggerRoute);

app.use(async(req, res, next) => {
	res.status(404).json({ message: "Unknown endpoint." });
});

const port = process.env.PORT;
const host = process.env.HOST;

app.listen(port, () => {
	console.log(`app listening on ${host}:${port}`);
});
