const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { generateJwtToken } = require('../utils/jwtUtils');
const { googleConfig, linkedInConfig, githubConfig } = require('./keys');

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: googleConfig.clientId,
            clientSecret: googleConfig.clientSecret,
            callbackURL: googleConfig.redirectUri,
        },
        (accessToken, refreshToken, profile, done) => {
            const token = generateJwtToken(profile.emails[0].value, profile.displayName);
            return done(null, token);
        }
    )
);

// LinkedIn OAuth Strategy
passport.use(
    new LinkedInStrategy(
        {
            clientID: linkedInConfig.clientId,
            clientSecret: linkedInConfig.clientSecret,
            callbackURL: linkedInConfig.redirectUri,
            scope: ['r_liteprofile', 'r_emailaddress'],
        },
        (accessToken, refreshToken, profile, done) => {
            const token = generateJwtToken(profile.emails[0].value, profile.displayName);
            return done(null, token);
        }
    )
);

// GitHub OAuth Strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: githubConfig.clientId,
            clientSecret: githubConfig.clientSecret,
            callbackURL: githubConfig.redirectUri,
            scope: ['user:email'],
        },
        (accessToken, refreshToken, profile, done) => {
            const token = generateJwtToken(profile.username, profile.displayName || profile.username);
            return done(null, token);
        }
    )
);
