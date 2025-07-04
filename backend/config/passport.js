const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../models/User');

// Configure Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback",
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    // 🔍 Check if a user already exists with this email
    let user = await User.findOne({ email });

    if (user) {
      // ❌ BLOCK: If any user exists with this email, do not register again
      return done(null,user);
    }

    // ✅ If user not found, register new Google user
    user = new User({
      fullName: profile.displayName,
      email: email,
      googleId: profile.id,
      password: null
    });

    await user.save();
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Session handlers (optional, for session-based auth)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
