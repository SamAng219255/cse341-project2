require("dotenv").config();
const swaggerAutogen = require("swagger-autogen")();

const doc = {
	info: {
		title: "Task Tracker API",
		description: "Stores and displays tasks per user.",
	},
	host: `${process.env.HOST}:${process.env.PORT}`,
	schemes: [ process.env.API_DOC_METHOD ],
	securityDefinitions: {
		github_auth: {
			type: "oauth2",
			flow: "accessCode",
			authorizationUrl: "https://github.com/login/oauth/authorize",
			tokenUrl: "https://github.com/login/oauth/access_token",
			scopes: {},
		},
	},
};

const outputFile = "./swagger.json";
const routes = [ "../routes/index.js" ];

swaggerAutogen(outputFile, routes, doc);
