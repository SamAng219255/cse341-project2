const usersModel = require("../models/users");
const tasksModel = require("../models/tasks");
const { DBNotReadyError, InvalidDataError, NotFoundError, ConflictingValueError } = require("../error_types");

const getUserById = async(req, res, next) => {
	let data;
	try {
		if(req.params.userId == undefined)
			throw new InvalidDataError();

		data = await usersModel.getUserById(req.params.userId);
	}
	/*
		#swagger.responses[200] = {
			description: 'User found and returned.',
			schema: {
				id: "000000000000000000000000",
				name: "John Doe",
				email: "user@example.com",
				githubId: "00000000"
			}
		}
		#swagger.responses[503] = { description: 'Server still turning on and not yet connected to database.' }
		#swagger.responses[400] = { description: 'Client provided an invalid user id.' }
		#swagger.responses[404] = { description: 'No user with the provided id exists.' }
		#swagger.responses[401] = { description: 'Attempted to access the endpoint without authenticating.' }
		#swagger.responses[403] = { description: 'Attempted to access the endpoint without matching authorization.' }
	*/
	catch(err) {
		if(err instanceof DBNotReadyError)
			res.status(503).json({ message: "Database not yet ready." });
		else if(err instanceof InvalidDataError)
			res.status(400).json({ message: "Data is missing or invalid." });
		else if(err instanceof NotFoundError)
			res.status(404).json({ message: "Requested user not found" });
		else {
			console.error(`getUserById: ${err.name}: ${err.message}`);
			res.sendStatus(500);
		}
	}
	res.status(200).json(data);
};

const getAllUsers = async(req, res, next) => {
	let data;
	try {
		data = await usersModel.getAllUsers();
	}
	/*
		#swagger.responses[200] = {
			description: 'Returns a list of all users.',
			schema: [{
				id: "000000000000000000000000",
				name: "John Doe",
				email: "user@example.com",
				githubId: "00000000"
			}]
		}
		#swagger.responses[503] = { description: 'Server still turning on and not yet connected to database.' }
	*/
	catch(err) {
		if(err instanceof DBNotReadyError)
			res.status(503).json({ message: "Database is not yet ready." });
		else {
			console.error(`getAllUsers: ${err.name}: ${err.message}`);
			res.sendStatus(500);
		}
	}
	res.status(200).json(data);
};

const addUser = async(req, res, next) => {
	/*
	#swagger.parameters['New User Information'] = {
		in: 'body',
		description: 'New value to update user record with.',
		required: true,
		schema: {
			$name: "John Doe",
			$email: "user@example.com",
			$githubId: "00000000"
		}
	}
	*/
	let id;
	try {
		if(req.body.githubId && await usersModel.githubExists(req.body.githubId, req.params.id))
			throw new ConflictingValueError();

		id = await usersModel.addUser(req.body);
	}
	/*
		#swagger.responses[201] = {
			description: 'User successfully added.',
			schema: {
				id: "000000000000000000000000"
			}
		}
		#swagger.responses[503] = { description: 'Server still turning on and not yet connected to database.' }
		#swagger.responses[400] = { description: 'Client did not provide sufficient data to create a user record or provided invalid data.' }
		#swagger.responses[409] = { description: 'GitHub id is already associated with another account.' }
	*/
	catch(err) {
		if(err instanceof DBNotReadyError)
			res.status(503).json({ message: "Database not yet ready." });
		else if(err instanceof InvalidDataError)
			res.status(400).json({ message: "Data is missing or invalid." });
		else if(err instanceof ConflictingValueError)
			res.status(409).json({ message: "GitHub id is already associated with another account." });
		else if(err.name == "ValidationError")
			res.status(400).json(err);
		else {
			console.error(`addUser: ${err.name}: ${err.message}`);
			res.sendStatus(500);
		}
	}
	res.status(201).json({ id });
};

const updateUser = async(req, res, next) => {
	/*
	#swagger.parameters['Updated User Information'] = {
		in: 'body',
		description: 'New value to update user record with.',
		required: true,
		schema: {
			$name: "John Doe",
			$email: "user@example.com",
			$githubId: "00000000"
		}
	}
	*/
	let data;
	try {
		if(req.params.userId == undefined)
			throw new InvalidDataError();
		if(req.body.githubId && await usersModel.githubExists(req.body.githubId, req.params.userId))
			throw new ConflictingValueError();

		data = await usersModel.updateUser(req.params.userId, req.body);
	}
	/*
		#swagger.responses[200] = {
			description: 'User found and updated.',
			schema: {
				id: "000000000000000000000000",
				name: "John Doe",
				email: "user@example.com",
				githubId: "00000000"
			}
		}
		#swagger.responses[503] = { description: 'Server still turning on and not yet connected to database.' }
		#swagger.responses[400] = { description: 'Client provided an invalid user id or body.' }
		#swagger.responses[404] = { description: 'No user with the provided id exists.' }
		#swagger.responses[409] = { description: 'GitHub id is already associated with another account.' }
		#swagger.responses[401] = { description: 'Attempted to access the endpoint without authenticating.' }
		#swagger.responses[403] = { description: 'Attempted to access the endpoint without matching authorization.' }
	*/
	catch(err) {
		if(err instanceof DBNotReadyError)
			res.status(503).json({ message: "Database not yet ready." });
		else if(err instanceof InvalidDataError)
			res.status(400).json({ message: "Data is missing or invalid." });
		else if(err instanceof NotFoundError)
			res.status(404).json({ message: "Requested user not found" });
		else if(err instanceof ConflictingValueError)
			res.status(409).json({ message: "GitHub id is already associated with another account." });
		else if(err.name == "ValidationError")
			res.status(400).json(err);
		else {
			console.error(`updateUser: ${err.name}: ${err.message}`);
			res.sendStatus(500);
		}
	}
	res.status(200).json(data);
};

const deleteUser = async(req, res, next) => {
	try {
		if(req.params.userId == undefined)
			throw new InvalidDataError();

		await tasksModel.removeTasksByUser(req.params.userId);
		await usersModel.deleteUser(req.params.userId);
	}
	/*
		#swagger.responses[204] = { description: 'User found and deleted.' }
		#swagger.responses[503] = { description: 'Server still turning on and not yet connected to database.' }
		#swagger.responses[400] = { description: 'Client provided an invalid user id.' }
		#swagger.responses[404] = { description: 'No user with the provided id exists.' }
		#swagger.responses[401] = { description: 'Attempted to access the endpoint without authenticating.' }
		#swagger.responses[403] = { description: 'Attempted to access the endpoint without matching authorization.' }
	*/
	catch(err) {
		if(err instanceof DBNotReadyError)
			res.status(503).json({ message: "Database not yet ready." });
		else if(err instanceof InvalidDataError)
			res.status(400).json({ message: "Data is missing or invalid." });
		else if(err instanceof NotFoundError)
			res.status(404).json({ message: "Requested user not found" });
		else {
			console.error(`deleteUser: ${err.name}: ${err.message}`);
			res.sendStatus(500);
		}
	}
	try {
		req.logout(function(err) {
			if(err) return next(err);
		});
	}
	finally {
		req.session.destroy();
	}
	res.sendStatus(204);
};

module.exports = {
	getUserById,
	getAllUsers,
	addUser,
	updateUser,
	deleteUser,
};
