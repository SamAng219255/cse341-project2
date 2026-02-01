const { mongoose, wrapReadyCheck } = require("../database/");
const { InvalidDataError, NotFoundError } = require("../error_types");

const ObjectId = mongoose.Types.ObjectId;

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const _model = mongoose.model(
	"users",
	mongoose.Schema(
		{
			name: {
				type: String,
				minLength: 3,
			},
			email: {
				type: String,
				validate: value => value == null || emailRegex.test(value),
			},
			githubId: String,
		},
		{ timestamps: true },
	),
);

const keys = [
	"name",
	"email",
	"githubId",
];

const copyNeededKeys = oldObj => Object.fromEntries(keys.filter(key => key in oldObj).map(key => [ key, oldObj[key] ]));

const getUserById = wrapReadyCheck(async id => {
	let _id;
	try {
		_id = new ObjectId(id);
	}
	catch(err) {
		console.error(`getUserById/ObjectId: ${err.name}: ${err.message}`);
		throw new InvalidDataError();
	}

	let result;
	try {
		result = await _model.findById(_id);
	}
	catch(err) {
		console.error(`getUserById/findById: ${err.name}: ${err.message}`);
		throw err;
	}

	if(result == null)
		throw new NotFoundError();

	return result;
});

const userExists = wrapReadyCheck(async id => {
	let _id;
	try {
		_id = new ObjectId(id);
	}
	catch(err) {
		console.error(`userExists/ObjectId: ${err.name}: ${err.message}`);
		throw new InvalidDataError();
	}

	let result;
	try {
		result = await _model.findById(_id);
	}
	catch(err) {
		console.error(`userExists/findById: ${err.name}: ${err.message}`);
		throw err;
	}

	return result != null;
});

const githubExists = wrapReadyCheck(async(githubId, excludeId = null) => {
	let result;
	try {
		result = await _model.findOne({ githubId });
	}
	catch(err) {
		console.error(`githubExists/findOne: ${err.name}: ${err.message}`);
		throw err;
	}

	return result != null && result._id.toString() != excludeId;
});

const getAllUsers = wrapReadyCheck(async() => {
	return await _model.find();
});

const addUser = wrapReadyCheck(async data => {
	if(!keys.every(key => key in data))
		throw new InvalidDataError();

	const _id = new ObjectId();

	try {
		await _model.create({ _id, ...copyNeededKeys(data) }); // Data is automatically validated against the schema
	}
	catch(err) {
		console.error(`addUser/create: ${err.name}: ${err.message}`);
		throw err;
	}

	return _id.toString();
});

const updateUser = wrapReadyCheck(async(id, data) => {
	let _id;
	try {
		_id = new ObjectId(id);
	}
	catch(err) {
		console.error(`updateUser/ObjectId: ${err.name}: ${err.message}`);
		throw new InvalidDataError();
	}

	if(await _model.findById(_id) == null)
		throw new NotFoundError();

	const cleanedData = copyNeededKeys(data);

	try {
		await new mongoose.Document(cleanedData, _model.schema).validate();

		await _model.updateOne({ _id }, cleanedData);
	}
	catch(err) {
		console.error(`updateUser/updateOne: ${err.name}: ${err.message}`);
		throw err;
	}

	return await _model.findById(_id);
});

const deleteUser = wrapReadyCheck(async id => {
	let _id;
	try {
		_id = new ObjectId(id);
	}
	catch(err) {
		console.error(`deleteUser/ObjectId: ${err.name}: ${err.message}`);
		throw new InvalidDataError();
	}

	const result = await _model.deleteOne({ _id });

	if(result.deletedCount < 1)
		throw new NotFoundError();
});

const getByGitHubOrCreate = wrapReadyCheck(async(data, callback) => {
	let result;
	try {
		result = await _model.findOne({ githubId: data.githubId });
	}
	catch(err) {
		console.error(`getByGitHubOrCreate/findOne: ${err.name}: ${err.message}`);
		throw err;
	}

	if(result == null) {
		if(!keys.every(key => key in data))
			throw new InvalidDataError();

		try {
			await _model.create({ ...copyNeededKeys(data) }); // Data is automatically validated against the schema
		}
		catch(err) {
			console.error(`getByGitHubOrCreate/create: ${err.name}: ${err.message}`);
			throw err;
		}

		try {
			result = await _model.findOne({ githubId: data.githubId });
		}
		catch(err) {
			console.error(`getByGitHubOrCreate/findOne/1: ${err.name}: ${err.message}`);
			throw err;
		}
	}

	if(callback)
		callback(null, result);

	return result;
});

module.exports = {
	getUserById,
	userExists,
	githubExists,
	getAllUsers,
	addUser,
	updateUser,
	deleteUser,
	getByGitHubOrCreate,
};
