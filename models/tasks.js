const { mongoose, wrapReadyCheck } = require("../database/");
const { InvalidDataError, NotFoundError } = require("../error_types");

const ObjectId = mongoose.Types.ObjectId;

const _model = mongoose.model(
	"tasks",
	mongoose.Schema(
		{
			title: String,
			description: String,
			status: {
				type: String,
				enum: [
					"todo",
					"in_progress",
					"done",
				],
			},
			priority: {
				type: Number,
				min: 1,
				max: 5,
			},
			dueDate: String,
			ownerUserId: mongoose.ObjectId,
			createdAt: String,
		},
		{ timestamps: true },
	),
);

const keys = [
	"title",
	"description",
	"status",
	"priority",
	"dueDate",
	"ownerUserId",
];

const copyNeededKeys = oldObj => Object.fromEntries(keys.filter(key => key in oldObj).map(key => [ key, oldObj[key] ]));

const getTaskById = wrapReadyCheck(async id => {
	let _id;
	try {
		_id = new ObjectId(id);
	}
	catch(err) {
		console.error(`${err.name}: ${err.message}`);
		throw new InvalidDataError();
	}

	const result = await _model.findById(_id);

	if(result == null)
		throw new NotFoundError();

	return result;
});

const getTasksByUser = wrapReadyCheck(async id => {
	let ownerUserId;
	try {
		ownerUserId = new ObjectId(id);
	}
	catch(err) {
		console.error(`${err.name}: ${err.message}`);
		throw new InvalidDataError();
	}

	const result = await _model.find({ ownerUserId });

	return result;
});

const makeTask = wrapReadyCheck(async data => {
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

const updateTask = wrapReadyCheck(async(id, data) => {
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

	const cleanedData = copyNeededKeys(data);
	delete cleanedData.ownerUserId;

	try {
		await _model.updateOne({ _id }, cleanedData);
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

const removeTask = wrapReadyCheck(async id => {
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

const removeTasksByUser = wrapReadyCheck(async id => {
	let ownerUserId;
	try {
		ownerUserId = new ObjectId(id);
	}
	catch(err) {
		console.error(`${err.name}: ${err.message}`);
		throw new InvalidDataError();
	}

	return (await _model.deleteMany({ ownerUserId })).deletedCount;
});

module.exports = {
	getTaskById,
	getTasksByUser,
	makeTask,
	updateTask,
	removeTask,
	removeTasksByUser,
};
