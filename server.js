/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/");
const swaggerRoutes = require("./routes/swagger");

const passport = require("./passport");
const session  = require("express-session");

/* ***********************
 * Middleware
 * ************************/

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Session Middleware
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
}));

// Passport (OAuth2) Middleware
app.use(passport.initialize());
app.use(passport.session());

// CORS middleware
app.use(cors());

// Routes
app.use(apiRoutes);
app.use(swaggerRoutes);
app.get("/", (req, res) => res.send(req.user !== undefined ? `Logged in as ${req.user.name}.` : "Logged out."));

app.use(async(req, res, next) => {
	res.status(404).json({ message: "Unknown endpoint." });
});

const port = process.env.PORT;
const host = process.env.HOST;

app.listen(port, () => {
	console.log(`app listening on ${host}:${port}`);
});
