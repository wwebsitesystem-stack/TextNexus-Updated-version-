// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 1. Database Connection Configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/nexus'
});

// 2. Global Security Layer (XSS, Clickjacking, and Header Protections)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Clean inline scripts up for full production later
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:"]
        }
    }
}));

// Body Parsers for form data and JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Production-Grade Secure Session Management
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session' // Stores active user sessions cleanly inside PostgreSQL
    }),
    secret: process.env.SESSION_SECRET || 'nexus_ultra_secure_fallback_secret_321',
    resave: false,
    saveUninitialized: false,
    name: '__Host-nexus-sid', // Custom cookie name to obscure tech stack
    cookie: {
        httpOnly: true,     // Prevents XSS scripts from reading the session cookie
        secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
        sameSite: 'lax',     // Mitigates CSRF attacks
        maxAge: 1000 * 60 * 60 * 24 * 7 // Session lasts 7 days
    }
}));

// 4. Rate Limiting to prevent Brute-Force Authentication attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login/register attempts per window
    message: { error: 'Too many attempts from this IP. Please try again after 15 minutes.' }
});

// 5. Authentication Gatekeeper Middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next(); // User is authenticated, let them proceed
    }
    // Not signed in? Send them directly back to the gatekeeper page
    res.redirect('/index.html');
};

// 6. Page Routing Logic
// Explicitly protect your core messaging interface
app.get('/textnexus.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'textnexus.html'));
});

// Serve public static assets (like index.html, CSS, frontend JS)
app.use(express.static(path.join(__dirname, 'public')));

// Root route: If logged in, go straight to messenger; else, go to landing page
app.get('/', (req, res) => {
    if (req.session && req.session.userId) {
        res.redirect('/textnexus.html');
    } else {
        res.redirect('/index.html');
    }
});

// 7. Core Authentication Endpoints (Placeholders to link with authController)
app.post('/api/auth/register', loginLimiter, async (req, res) => {
    // Handling registration data cleanly...
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
    // Authenticating user and assigning req.session.userId...
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Could not log out' });
        res.clearCookie('__Host-nexus-sid');
        res.json({ success: true });
    });
});

// 8. Spin Up the Platform Engine
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`📡 Nexus Engine is fully functional on port ${PORT}`);
});
