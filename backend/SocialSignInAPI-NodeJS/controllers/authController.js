const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const querystring = require('querystring');
const { googleConfig, linkedInConfig, githubConfig, jwtSecret } = require('../config/keys');

// Create Google OAuth2 client
const clientOptions = {
    clientId: googleConfig.clientId,
    clientSecret: googleConfig.clientSecret,
    redirectUri: googleConfig.redirectUri
};
const googleClient = new OAuth2Client(clientOptions);

const authController = {
    /**
     * Redirects user to the appropriate provider's authorization URL.
     */
    loginWithProvider: (req, res) => {
        const provider = req.params.provider;
        let authUrl;

        switch (provider) {
            case 'google':
                authUrl = `${googleConfig.authUri}?client_id=${googleConfig.clientId}&redirect_uri=${googleConfig.redirectUri}&response_type=code&scope=openid email profile`;
                break;
            case 'linkedin':
                authUrl = `${linkedInConfig.authUri}?response_type=code&client_id=${linkedInConfig.clientId}&redirect_uri=${linkedInConfig.redirectUri}&scope=r_liteprofile r_emailaddress`;
                break;
            case 'github':
                authUrl = `${githubConfig.authUri}?client_id=${githubConfig.clientId}&redirect_uri=${githubConfig.redirectUri}&scope=user:email`;
                break;
            default:
                return res.status(400).json({ error: 'Invalid provider' });
        }

        res.redirect(authUrl);
    },

    /**
     * Handles the OAuth callback, exchanges code for token, verifies, and issues JWT.
     */
    handleCallback: async (req, res) => {
        const provider = req.params.provider;
        const code = req.query.code;

        console.log({ provider, code });

        if (!code) {
            return res.status(400).json({ error: 'Missing authorization code' });
        }

        try {
            let userInfo;

            switch (provider) {
                case 'google':
                    userInfo = await authController.handleGoogleCallback(code);
                    break;
                case 'linkedin':
                    userInfo = await authController.handleLinkedInCallback(code);
                    break;
                case 'github':
                    userInfo = await authController.handleGitHubCallback(code);
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid provider' });
            }

            // Create a JWT token
            const token = jwt.sign(userInfo, jwtSecret, { expiresIn: '1h' });

            // Redirect to frontend with the token
            const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
            res.redirect(`${frontendUrl}/?token=${token}`);
        } catch (error) {
            console.error(error);
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/?error=${error.message}`);
        }
    },

    /**
     * Handles Google OAuth callback.
     */
    handleGoogleCallback: async (code) => {
        const { tokens } = await googleClient.getToken({
            code,
            redirect_uri: googleConfig.redirectUri,
        });

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: googleConfig.clientId,
        });

        const payload = ticket.getPayload();

        return {
            email: payload.email,
            username: payload.name,
        };
    },

    /**
     * Handles LinkedIn OAuth callback.
     */
    handleLinkedInCallback: async (code) => {
        const tokenResponse = await axios.post(linkedInConfig.tokenUri, querystring.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: linkedInConfig.redirectUri,
            client_id: linkedInConfig.clientId,
            client_secret: linkedInConfig.clientSecret,
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const token = tokenResponse.data.access_token;

        const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
            headers: { Authorization: `Bearer ${token}` },
        });

        const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
            headers: { Authorization: `Bearer ${token}` },
        });

        return {
            email: emailResponse.data.elements[0]['handle~'].emailAddress,
            username: profileResponse.data.localizedFirstName,
        };
    },

    /**
     * Handles GitHub OAuth callback.
     */
    handleGitHubCallback: async (code) => {
        const tokenResponse = await axios.post(githubConfig.tokenUri, querystring.stringify({
            client_id: githubConfig.clientId,
            client_secret: githubConfig.clientSecret,
            code,
            redirect_uri: githubConfig.redirectUri,
        }), { headers: { Accept: 'application/json' } });

        const token = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${token}` },
        });

        const emailResponse = await axios.get('https://api.github.com/user/emails', {
            headers: { Authorization: `token ${token}` },
        });

        console.log(emailResponse);

        const primaryEmail = emailResponse.data.find(email => email.primary).email;

        console.log(primaryEmail);

        return {
            email: primaryEmail,
            username: userResponse.data.login,
        };
    },
};

module.exports = authController;
