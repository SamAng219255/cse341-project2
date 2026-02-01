const express = require("express");
const router = express.Router();

router.use("/tasks/", require("./tasks"));

router.use("/users/", require("./users"));

router.use("/", require("./login"));

module.exports = router;
