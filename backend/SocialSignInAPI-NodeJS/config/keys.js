require('dotenv').config();

module.exports = {
    googleConfig: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        authUri: 'https://accounts.google.com/o/oauth2/v2/auth',
    },
    linkedInConfig: {
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        redirectUri: process.env.LINKEDIN_REDIRECT_URI,
        authUri: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUri: 'https://www.linkedin.com/oauth/v2/accessToken',
    },
    githubConfig: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectUri: process.env.GITHUB_REDIRECT_URI,
        authUri: 'https://github.com/login/oauth/authorize',
        tokenUri: 'https://github.com/login/oauth/access_token',
    },
    jwtSecret: process.env.JWT_SECRET
};
