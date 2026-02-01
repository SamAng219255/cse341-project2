const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const { reqAuthorize } = require("../middleware/authorize");

router.get("/:userId", /* #swagger.security = [{"github_auth": []}] */ reqAuthorize({ idMatchesParam: "userId" }), usersController.getUserById);

router.get("/", usersController.getAllUsers);

router.post("/", usersController.addUser);

router.put("/:userId", /* #swagger.security = [{"github_auth": []}] */ reqAuthorize({ idMatchesParam: "userId" }), usersController.updateUser);

router.delete("/:userId", /* #swagger.security = [{"github_auth": []}] */ reqAuthorize({ idMatchesParam: "userId" }), usersController.deleteUser);

module.exports = router;
