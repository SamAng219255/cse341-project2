const reqAuthorize = ({ mode = "every", idMatchesParam = false } = {}) => {
	if(!mode == "every" && !mode == "any")
		throw new RangeError("reqAuthorize: 'mode' must be one of 'any' or 'every'.");

	const requirements = [];
	if(idMatchesParam) requirements.push((req, res) => req.params[idMatchesParam] == req.user.id);

	if(requirements.length == 0)
		return (req, res, next) => {
			if(req.user == undefined)
				return res.status(401).json({ message: "You require authorization to use this endpoint." });
			else
				return next();
		};
	else
		return (req, res, next) => {
			if(req.user == undefined)
				return res.status(401).json({ message: "You require authorization to use this endpoint." });

			else if(requirements[mode](requirement => requirement(req, res)))
				return next();

			else
				return res.status(403).json({ message: "You are not authorized to make this request." });
		};
};

module.exports =  { reqAuthorize };
