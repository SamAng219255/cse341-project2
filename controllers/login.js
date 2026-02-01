const passport = require("../passport");

const login = [
	passport.authenticate("github"),
	(req, res, next) => {
		const refererUrl = req.headers['referer'] || req.headers['referrer'];

		if(refererUrl)
			req.session.loginReferer = refererUrl;
		else
			req.session.loginReferer = null;

		next();
	}
];

const logout = (req, res, next) => {
	req.logout(function(err) {
		if(err) return next(err);
		res.redirect("/");
	});
};

const callback = [
	passport.authenticate(
		"github",
		{ failureRedirect: "/api-docs" },
	),
	(req, res) => {
		if(req.session.loginReferer)
			res.redirect(req.session.loginReferer);
		else
			res.redirect("/");
	},
];

module.exports = {
	login,
	logout,
	callback,
};
