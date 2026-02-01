const tasksModel = require("../models/tasks");
const usersModel = require("../models/users");
const { DBNotReadyError, InvalidDataError, NotFoundError } = require("../error_types");

const getTaskById = async(req, res, next) => {
	let data;
	try {
		if(req.params.taskId == undefined)
			throw new InvalidDataError();

		data = await tasksModel.getTaskById(req.params.taskId, req.params.userId);
	}
	/*
		#swagger.responses[200] = {
			description: 'Task found and returned.',
			schema: {
				id: "000000000000000000000000",
				title: "Buy groceries",
				description: "Milk, bread, eggs",
				status: "todo",
				priority: 2,
				dueDate: "2026-01-25",
				ownerUserId: "65b2f9c1e4a3c9a7d8f12345",
			}
		}
		#swagger.responses[503] = { description: 'Server still turning on and not yet connected to database.' }
		#swagger.responses[400] = { description: 'Client provided an invalid task id.' }
		#swagger.responses[404] = { description: 'No task with the provided id exists.' }
		#swagger.responses[401] = { description: 'Attempted to access the endpoint without authenticating.' }
		#swagger.responses[403] = { description: 'Attempted to access the endpoint without matching authorization.' }
	*/
	catch(err) {
		if(err instanceof DBNotReadyError)
			res.status(503).json({ message: "Database is not yet ready." });
		else if(err instanceof InvalidDataError)
			res.status(400).json({ message: "Data is missing or invalid." });
		else if(err instanceof NotFoundError)
			res.status(404).json({ message: "Requested task not found." });
		else {
			console.log(`${err.name}: ${err.message}`);
			res.sendStatus(500);
		}
	}
	res.status(200).json(data);
};

const getTasksByUser = async(req, res, next) => {
	let data;
	try {
		if(req.params.userId == undefined)
			throw new InvalidDataError();

		data = await tasksModel.getTasksByUser(req.params.userId);
	}
	/*
		#swagger.responses[200] = {
			description: 'Returns list of tasks owned by the given user. May be empty.',
			schema: [{
				id: "000000000000000000000000",
				title: "Buy groceries",
				description: "Milk, bread, eggs",
				status: "todo",
				priority: 2,
				dueDate: "2026-01-25",
				ownerUserId: "65b2f9c1e4a3c9a7d8f12345",
			}]
		}
		#swagger.responses[503] = { description: 'Server still turning on and not yet connected to database.' }
		#swagger.responses[400] = { description: 'Client provided an invalid user id.' }
		#swagger.responses[401] = { description: 'Attempted to access the endpoint without authenticating.' }
		#swagger.responses[403] = { description: 'Attempted to access the endpoint without matching authorization.' }
	*/
	catch(err) {
		if(err instanceof DBNotReadyError)
			res.status(503).json({ message: "Database is not yet ready." });
		else if(err instanceof InvalidDataError)
			res.status(400).json({ message: "Data is missing or invalid." });
		else {
			console.log(`${err.name}: ${err.message}`);
			res.sendStatus(500);
		}
	}
	res.status(200).json(data);
};

const makeTask = async(req, res, next) => {
	/*
	#swagger.parameters['New Task Information'] = {
		in: 'body',
		description: 'New value to update task record with.',
		required: true,
		schema: {
			$title: "Buy groceries",
			$description: "Milk, bread, eggs",
			$status: "todo",
			$priority: 2,
			$dueDate: "2026-01-25",
		}
	}
	*/
	let id;
	try {
		if(!(await usersModel.userExists(req.user.id)))
			throw new InvalidDataError();

		id = await tasksModel.makeTask({ ownerUserId: req.user.id, ...req.body });
	}
	/*
		#swagger.responses[201] = {
			description: 'Task successfully created.',
			schema: {
				id: "000000000000000000000000"
			}
		}
		#swagger.responses[503] = { description: 'Server still turning on and not yet connected to database.' }
		#swagger.responses[400] = { description: 'Client did not provide sufficient data to create a task record or provided invalid data such as the ownerUserId not matching an existing user.' }
		#swagger.responses[401] = { description: 'Attempted to access the endpoint without authenticating.' }
	*/
	catch(err) {
		if(err instanceof DBNotReadyError)
			res.status(503).json({ message: "Database is not yet ready." });
		else if(err instanceof InvalidDataError)
			res.status(400).json({ message: "Data is missing or invalid." });
		else if(err.name == "ValidationError")
			res.status(400).json(err);
		else {
			console.log(`${err.name}: ${err.message}`);
			res.sendStatus(500);
		}
	}
	res.status(201).json({ id });
};

const updateTask = async(req, res, next) => {
	/*
	#swagger.parameters['New Task Information'] = {
		in: 'body',
		description: 'New value to update task record with.',
		required: true,
		schema: {
			title: "Buy groceries",
			description: "Milk, bread, eggs",
			status: "todo",
			priority: 2,
			dueDate: "2026-01-25",
		}
	}
	*/
	let data;
	try {
		if(req.params.taskId == undefined)
			throw new InvalidDataError();

		data = await tasksModel.updateTask(req.params.taskId, req.params.userId, req.body);
	}
	/*
		#swagger.responses[200] = {
			description: 'Task found and updated. The body is the new complete task record.',
			schema: {
				id: "000000000000000000000000",
				title: "Buy groceries",
				description: "Milk, bread, eggs",
				status: "todo",
				priority: 2,
				dueDate: "2026-01-25",
				ownerUserId: "65b2f9c1e4a3c9a7d8f12345",
			}
		}
		#swagger.responses[503] = { description: 'Server still turning on and not yet connected to database.' }
		#swagger.responses[400] = { description: 'Client provided an invalid task id or body.' }
		#swagger.responses[404] = { description: 'No task with the provided id exists.' }
		#swagger.responses[401] = { description: 'Attempted to access the endpoint without authenticating.' }
		#swagger.responses[403] = { description: 'Attempted to access the endpoint without matching authorization.' }
	*/
	catch(err) {
		if(err instanceof DBNotReadyError)
			res.status(503).json({ message: "Database is not yet ready." });
		else if(err instanceof InvalidDataError)
			res.status(400).json({ message: "Data is missing or invalid." });
		else if(err instanceof NotFoundError)
			res.status(404).json({ message: "Requested task not found." });
		else if(err.name == "ValidationError")
			res.status(400).json(err);
		else {
			console.log(`${err.name}: ${err.message}`);
			res.sendStatus(500);
		}
	}
	res.status(200).json(data);
};

const removeTask = async(req, res, next) => {
	try {
		if(req.params.taskId == undefined)
			throw new InvalidDataError();

		await tasksModel.removeTask(req.params.taskId, req.params.userId);
	}
	/*
		#swagger.responses[204] = { description: 'Task found and deleted.' }
		#swagger.responses[503] = { description: 'Server still turning on and not yet connected to database.' }
		#swagger.responses[400] = { description: 'Client provided an invalid task id.' }
		#swagger.responses[404] = { description: 'No task with the provided id exists.' }
		#swagger.responses[401] = { description: 'Attempted to access the endpoint without authenticating.' }
		#swagger.responses[403] = { description: 'Attempted to access the endpoint without matching authorization.' }
	*/
	catch(err) {
		if(err instanceof DBNotReadyError)
			res.status(503).json({ message: "Database is not yet ready." });
		else if(err instanceof InvalidDataError)
			res.status(400).json({ message: "Data is missing or invalid." });
		else if(err instanceof NotFoundError)
			res.status(404).json({ message: "Requested task not found." });
		else {
			console.log(`${err.name}: ${err.message}`);
			res.sendStatus(500);
		}
	}
	res.sendStatus(204);
};

module.exports = {
	getTaskById,
	getTasksByUser,
	makeTask,
	updateTask,
	removeTask,
};
