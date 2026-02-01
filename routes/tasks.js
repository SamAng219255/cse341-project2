const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/tasks");
const { reqAuthorize } = require("../middleware/authorize");

router.get("/:userId", /* #swagger.security = [{"github_auth": []}] */ reqAuthorize({ idMatchesParam: "userId" }), tasksController.getTasksByUser);

router.get("/:userId/:taskId", /* #swagger.security = [{"github_auth": []}] */ reqAuthorize({ idMatchesParam: "userId" }), tasksController.getTaskById);

router.post("/", /* #swagger.security = [{"github_auth": []}] */ reqAuthorize(), tasksController.makeTask);

router.put("/:userId/:taskId", /* #swagger.security = [{"github_auth": []}] */ reqAuthorize({ idMatchesParam: "userId" }), tasksController.updateTask);

router.delete("/:userId/:taskId", /* #swagger.security = [{"github_auth": []}] */ reqAuthorize({ idMatchesParam: "userId" }), tasksController.removeTask);

module.exports = router;
