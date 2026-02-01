const express = require("express");
const router = express.Router();
const loginController = require("../controllers/login");

router.get("/login", loginController.login);

router.get("/logout", loginController.logout);

router.get("/github/callback", loginController.callback);

module.exports = router;
