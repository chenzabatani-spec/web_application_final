import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import User from '../models/user_model';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
}, 
async (accessToken, refreshToken, profile, done) => {
    try {

        // Check if user already exists in our DB
        const email = profile.emails?.[0].value;
        let user = await User.findOne({ email });

        if (!user) {

            // If not, create a new user with a random password (since they won't use it)
            const salt = await bcrypt.genSalt(10);
            const randomPassword = Math.random().toString(36).slice(-8) + 'Gg1!';
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
                email: email,
                username: profile.displayName,
                photo: profile.photos?.[0].value || '',
                password: hashedPassword, // No password since it's OAuth
            });
        }

        // Pass the user to the route
        return done(null, user);
    } catch (err) {
        return done(err as Error, undefined);
    }
}));