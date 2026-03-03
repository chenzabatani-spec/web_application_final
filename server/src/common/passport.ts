import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user_model';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: "http://localhost:3000/auth/google/callback"
}, 
async (accessToken, refreshToken, profile, done) => {
    try {

        // Check if user already exists in our DB
        const email = profile.emails?.[0].value;
        let user = await User.findOne({ email });

        if (!user) {
            // If not, create a new user
            user = await User.create({
                email: email,
                username: profile.displayName,
                photo: profile.photos?.[0].value || '',
            });
        }

        // Pass the user to the route
        return done(null, user);
    } catch (err) {
        return done(err as Error, undefined);
    }
}));