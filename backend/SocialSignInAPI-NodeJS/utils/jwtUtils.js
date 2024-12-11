const jwt = require('jsonwebtoken');

function generateJwtToken(email, username) {
    return jwt.sign({ email, username }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { generateJwtToken };
