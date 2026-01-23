const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/tasks");

router.get("/user/:id", tasksController.getTasksByUser);

router.get("/:id", tasksController.getTaskById);

router.post("/", tasksController.makeTask);

router.put("/:id", tasksController.updateTask);

router.delete("/:id", tasksController.removeTask);

module.exports = router;
