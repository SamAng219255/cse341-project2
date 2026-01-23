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
				validate: (value) => emailRegex.test(value),
			},
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

const getUserByEmail = wrapReadyCheck(async email => {
	let result;
	try {
		result = await _model.findOne({ email });
	}
	catch(err) {
		console.error(`getUserByEmail/findOne: ${err.name}: ${err.message}`);
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
		console.error(`emailExists/findOne: ${err.name}: ${err.message}`);
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
