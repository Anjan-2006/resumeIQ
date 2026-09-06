const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const userModel = require("../models/user.model");
const config = require("./config");
const crypto = require("crypto");

async function generateUniqueUsername(preferredName, email) {
  let baseUsername = (preferredName || email.split("@")[0] || "user")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");

  if (!baseUsername) {
    baseUsername = "user";
  }

  let candidateUsername = baseUsername;
  let userExists = await userModel.findOne({ username: candidateUsername });

  while (userExists) {
    const randomSuffix = crypto.randomBytes(3).toString("hex");
    candidateUsername = `${baseUsername}_${randomSuffix}`;
    userExists = await userModel.findOne({ username: candidateUsername });
  }

  return candidateUsername;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value.toLowerCase() : null;

        if (!email) {
          return done(new Error("No email found in Google profile"), null);
        }

        // Require Google's email_verified value to be true before allowing account linking or authentication
        const isEmailVerified = Boolean(
          profile._json?.email_verified === true ||
          profile._json?.email_verified === "true" ||
          (profile.emails && (profile.emails[0]?.verified === true || profile.emails[0]?.verified === "true"))
        );

        if (!isEmailVerified) {
          return done(new Error("Google account email is not verified"), null);
        }

        // 1. Look up existing user by Google ID
        let user = await userModel.findOne({ googleId });
        if (user) {
          return done(null, user);
        }

        // 2. Look up existing user by email
        user = await userModel.findOne({ email });
        if (user) {
          // Link existing account with Google ID and ensure verified
          user.googleId = googleId;
          user.isVerified = true;
          await user.save();
          return done(null, user);
        }

        // 3. Create new user for first-time Google sign-in
        const uniqueUsername = await generateUniqueUsername(profile.displayName, email);
        const newUser = await userModel.create({
          username: uniqueUsername,
          email: email,
          googleId: googleId,
          isGuest: false,
          isVerified: true,
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
