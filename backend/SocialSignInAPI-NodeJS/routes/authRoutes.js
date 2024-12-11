const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();
const { CLIENT_URL } = process.env;

// The route expects a provider (google, linkedin, github) as a parameter
router.get('/:provider/callback', authController.handleCallback);


// ----- Google -----
// Start OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle callback
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    authController.handleCallback
);


// ----- LinkedIn -----
// Start OAuth flow
router.get('/linkedin', passport.authenticate('linkedin'));

// Handle callback
router.get(
    '/linkedin/callback',
    passport.authenticate('linkedin', { session: false, scope: ['r_liteprofile', 'r_emailaddress'], }),
    authController.handleCallback
);


// ----- GitHub -----
// Start OAuth flow
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// Handle callback
router.get(
    '/github/callback',
    passport.authenticate('github', { session: false }),
    authController.handleCallback
);

module.exports = router;
