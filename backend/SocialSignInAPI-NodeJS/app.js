const express = require('express');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();
require('./config/keys');
require('./config/passport');

const app = express();

// Setup session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
}));

app.use(express.json());

// Initialize Passport and restore authentication state
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
    return res.status(200).json({ message: "Get route working!" });
});

app.use('/auth', authRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res, next) => {
    console.log('Request:', req.method, req.url);
    next();
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
