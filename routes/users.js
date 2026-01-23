const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");

router.get("/email/", usersController.getUserByEmail);

router.get("/:id", usersController.getUserById);

router.get("/", usersController.getAllUsers);

router.post("/", usersController.addUser);

router.put("/:id", usersController.updateUser);

router.delete("/:id", usersController.deleteUser);

module.exports = router;
