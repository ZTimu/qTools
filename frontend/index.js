const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const net = require('net');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Setup Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        formatDate: function(date) {
            return new Date(date).toLocaleDateString();
        },
        eq: function(a, b) {
            return a === b;
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '../backend/uploads')));

// Setup Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Proxy configuration
const API_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Simple auth check middleware (for demo purposes)
// In a real app, you would verify JWT token here
const checkAuth = async (req, res, next) => {
    try {
        // Get token from cookies, localStorage (via query param), or session
        const token = req.query.token || req.cookies?.token;
        
        console.log('Auth check - Token found:', !!token);
        
        // Default to not logged in
        res.locals.isLoggedIn = false;
        
        // If there's a token, verify it with the backend
        if (token) {
            console.log('Verifying token with backend');
            const response = await fetch(`${API_URL}/api/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });
            
            const data = await response.json();
            console.log('Backend auth response:', data);
            
            // Set authentication status based on backend response
            if (response.ok && data.isAuthenticated) {
                console.log('User authenticated:', data.name);
                res.locals.isLoggedIn = true;
                res.locals.userName = data.name;
            } else {
                console.log('Token verification failed:', data.message);
            }
        }
    } catch (error) {
        console.error('Auth verification error:', error);
        // In case of error, default to not logged in
        res.locals.isLoggedIn = false;
    }
    
    // Set active navigation item
    res.locals.active = {
        dashboard: req.path === '/dashboard',
        login: req.path === '/login',
        register: req.path === '/register'
    };
    
    console.log('Auth check result - isLoggedIn:', res.locals.isLoggedIn);
    next();
};

// Apply the middleware to all routes
app.use(async (req, res, next) => {
    await checkAuth(req, res, next);
});

// View Routes
app.get('/', (req, res) => {
    if (res.locals.isLoggedIn) {
        res.redirect('/dashboard');
    } else {
        res.render('landing', { 
            title: 'QuickTools - Boost Your Productivity',
            hideNavbar: true,
            isLoggedIn: res.locals.isLoggedIn  // Pass authentication status to template
        });
    }
});

app.get('/login', (req, res) => {
    // If already logged in, redirect to dashboard
    if (res.locals.isLoggedIn) {
        return res.redirect('/dashboard');
    }
    
    res.render('auth/login', { 
        title: 'Login',
        hideFooter: true,
        hideNavLinks: true  // Hide login/register links in navbar
    });
});

app.get('/register', (req, res) => {
    // If already logged in, redirect to dashboard
    if (res.locals.isLoggedIn) {
        return res.redirect('/dashboard');
    }
    
    res.render('auth/register', { 
        title: 'Create Account',
        hideFooter: true,
        hideNavLinks: true  // Hide login/register links in navbar
    });
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { 
        title: 'Dashboard'
    });
});

// Tool Routes
app.get('/tools/pdf-to-word', (req, res) => {
    res.render('tools/pdf-to-word', { 
        title: 'PDF to Word Conversion'
    });
});

app.get('/tools/image-to-text', (req, res) => {
    res.render('tools/image-to-text', { 
        title: 'Image to Text Extraction'
    });
});

app.get('/tools/temperature-mass-converter', (req, res) => {
    res.render('tools/temperature-mass-converter', { 
        title: 'Temperature & Mass Conversion' 
    });
});

app.get('/tools/qr-generator', (req, res) => {
    res.render('tools/qr-generator', { 
        title: 'QR Code Generator' 
    });
});

app.get('/tools/calculator', (req, res) => {
    res.render('tools/calculator', { 
        title: 'Calculator' 
    });
});

// Currency converter route
app.get('/tools/currency-converter', (req, res) => {
    res.render('tools/currency-converter', { 
        title: 'Currency Converter' 
    });
});

// Logout route that clears token and redirects to login
app.get('/logout', (req, res) => {
    // Clear cookie if using cookie auth
    if (req.cookies?.token) {
        res.clearCookie('token');
    }
    
    // Redirect to home page
    res.redirect('/');
});

// API route to check token validity
app.post('/api/check-auth', (req, res) => {
    // In a real app, you would verify the token with the backend
    // For now, we'll just check if a token was provided
    const token = req.body.token;
    if (token) {
        return res.json({ 
            isValid: true, 
            message: 'Token is valid' 
        });
    }
    
    return res.status(401).json({ 
        isValid: false, 
        message: 'Invalid token' 
    });
});

// Function to check if a port is in use
const isPortInUse = (port) => {
    return new Promise((resolve) => {
        const tester = net.createServer()
            .once('error', err => {
                if (err.code === 'EADDRINUSE') {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .once('listening', () => {
                tester.once('close', () => resolve(false))
                    .close();
            })
            .listen(port);
    });
};

// Function to find an available port
const findAvailablePort = async (startPort, maxAttempts = 10) => {
    let port = startPort;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        const inUse = await isPortInUse(port);
        if (!inUse) {
            return port;
        }
        port++;
        attempts++;
    }
    
    throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
};

// Get port from environment or use default
const DEFAULT_PORT = 3000;
let PORT = process.env.FRONTEND_PORT ? parseInt(process.env.FRONTEND_PORT) : DEFAULT_PORT;

// Start the server with port handling
const startServer = async () => {
    try {
        // Check if specified port is in use
        const portInUse = await isPortInUse(PORT);
        
        if (portInUse && !process.env.FRONTEND_PORT) {
            // If default port is in use and no specific port was requested, find an available port
            console.log(`Port ${PORT} is already in use. Attempting to find an available port...`);
            PORT = await findAvailablePort(PORT + 1);
            console.log(`Found available port: ${PORT}`);
        }
        
        const server = app.listen(PORT, '0.0.0.0')
            .on('error', (error) => {
                console.error('Server error:', error);
                process.exit(1);
            })
            .on('listening', () => {
                console.log(`Frontend server is running on port ${PORT}`);
                console.log(`Backend API URL: ${API_URL}`);
            });
            
        // Handle graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
                process.exit(0);
            });
        });
        
        return server;
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        console.error(`Please try:
1. Stop any other servers running on ports ${DEFAULT_PORT}-${DEFAULT_PORT + 10}
2. Choose a specific port by setting FRONTEND_PORT environment variable
3. Wait a few seconds and try again`);
        process.exit(1);
    }
};

// Start the server
startServer();