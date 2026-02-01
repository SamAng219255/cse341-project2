const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

const usersModel = require("./models/users");

passport.use(new GitHubStrategy(
	{
		clientID: process.env.GITHUB_CLIENT_ID,
		clientSecret: process.env.GITHUB_CLIENT_SECRET,
		callbackURL: process.env.CALLBACK_URL,
	},
	function(accessToken, refreshToken, profile, done) {
		usersModel.getByGitHubOrCreate({ name: profile.displayName || profile.username, email: profile._json.email, githubId: profile.id }, function(err, user) {
			return done(err, user);
		});
	},
));

passport.serializeUser((user, done) => {
	done(null, user._id);
});
passport.deserializeUser(async(userId, done) => {
	try {
		const user = await usersModel.getUserById(userId);

		user.id = user._id.toString();

		done(null, user);
	}
	catch(err) {
		done(err, null);
	}
});

module.exports = passport;
