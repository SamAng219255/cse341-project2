const { mongoose, wrapReadyCheck } = require("../database/");
const { InvalidDataError, NotFoundError } = require("../error_types");

const ObjectId = mongoose.Types.ObjectId;

const _model = mongoose.model(
	"users",
	mongoose.Schema(
		{
			name: String,
			email: String,
			password: String,
		},
		{ timestamps: true },
	),
);

const keys = [
	"name",
	"email",
	"password",
];

const copyNeededKeys = oldObj => Object.fromEntries(keys.filter(key => key in oldObj).map(key => [ key, oldObj[key] ]));

const getUserById = wrapReadyCheck(async id => {
	let _id;
	try {
		_id = new ObjectId(id);
	}
	catch(err) {
		console.error(`${err.name}: ${err.message}`);
		throw new InvalidDataError();
	}

	let result;
	try {
		result = await _model.findById(_id);
	}
	catch(err) {
		console.error(`${err.name}: ${err.message}`);
		if(err.name == "ValidationError")
			throw new InvalidDataError();
		else
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
		console.error(`${err.name}: ${err.message}`);
		throw new InvalidDataError();
	}

	let result;
	try {
		result = await _model.findById(_id);
	}
	catch(err) {
		console.error(`${err.name}: ${err.message}`);
		if(err.name == "ValidationError")
			throw new InvalidDataError();
		else
			throw err;
	}

	return result != null;
});

const getUserByEmail = wrapReadyCheck(async email => {
	let result;
	try {
		result = await _model.findOne({ email });
	}
	catch(err) {
		console.error(`${err.name}: ${err.message}`);
		if(err.name == "ValidationError")
			throw new InvalidDataError();
		else
			throw err;
	}

	if(result == null)
		throw new NotFoundError();

	return result;
});

const emailExists = wrapReadyCheck(async(email, excludeId = null) => {
	let result;
	try {
		result = await _model.findOne({ email });
	}
	catch(err) {
		console.error(`${err.name}: ${err.message}`);
		if(err.name == "ValidationError")
			throw new InvalidDataError();
		else
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
		await _model.create({ _id, ...copyNeededKeys(data) });
	}
	catch(err) {
		console.error(`${err.name}: ${err.message}`);
		if(err.name == "ValidationError")
			throw new InvalidDataError();
		else
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
		console.error(`${err.name}: ${err.message}`);
		throw new InvalidDataError();
	}

	if(await _model.findById(_id) == null)
		throw new NotFoundError();

	try {
		await _model.updateOne({ _id }, copyNeededKeys(data));
	}
	catch(err) {
		console.error(`${err.name}: ${err.message}`);
		if(err.name == "ValidationError")
			throw new InvalidDataError();
		else
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
		console.error(`${err.name}: ${err.message}`);
		throw new InvalidDataError();
	}

	const result = await _model.deleteOne({ _id });

	if(result.deletedCount < 1)
		throw new NotFoundError();
});

module.exports = {
	getUserById,
	userExists,
	getUserByEmail,
	emailExists,
	getAllUsers,
	addUser,
	updateUser,
	deleteUser,
};
