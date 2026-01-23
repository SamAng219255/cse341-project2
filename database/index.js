const mongoose = require("mongoose");
const { DBNotReadyError } = require("../error_types");

mongoose.Promise = global.Promise;

let _ready = false;
const isReady = () => {
	return _ready;
};

const _onReady = [];
const addOnReady = func => {
	_onReady.push(func);
	if(isReady())
		func();
};

const wrapReadyCheck = func => {
	return async(...args) => {
		if(isReady())
			return await func(...args);
		else
			throw new DBNotReadyError();
	};
};

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => {
		console.log("Connected to the database!");
		_ready = true;
		_onReady.forEach(func => func());
	})
	.catch(err => {
		console.log("Cannot connect to the database!", err);
		process.exit();
	});

module.exports = {
	mongoose,
	isReady,
	addOnReady,
	wrapReadyCheck,
};
