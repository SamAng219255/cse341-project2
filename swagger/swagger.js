require("dotenv").config();
const swaggerAutogen = require("swagger-autogen")();

const doc = {
	info: {
		title: "Task Tracker API",
		description: "Stores and displays tasks per user.",
	},
	host: `${process.env.HOST}:${process.env.PORT}`,
	schemes: [ process.env.API_DOC_METHOD ],
};

const outputFile = "./swagger.json";
const routes = [ "../routes/index.js" ];

swaggerAutogen(outputFile, routes, doc);
