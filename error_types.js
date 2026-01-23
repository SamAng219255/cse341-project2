class DBNotReadyError extends Error {
	constructor() {
		super("Request to database before database is finished being initialized.");
		this.name = "DBNotReadyError";
	}
}

class InvalidDataError extends Error {
	constructor() {
		super("Received data doesn't match required format.");
		this.name = "InvalidDataError";
	}
}

class NotFoundError extends Error {
	constructor() {
		super("Requested resource was not found.");
		this.name = "NotFoundError";
	}
}

class ConflictingValueError extends Error {
	constructor(varName = "Unique variable") {
		super(`${varName} already exists and must be unique.`);
		this.name = "ConflictingValueError";
	}
}

module.exports = {
	DBNotReadyError,
	InvalidDataError,
	NotFoundError,
	ConflictingValueError,
};
