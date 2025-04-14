// Server entry point that imports and runs the main application
const app = require('./src/app');
const path = require('path');
const net = require('net');

app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'handlebars');

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
const DEFAULT_PORT = 5000;
let PORT = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;

// Start the server with port handling
const startServer = async () => {
    try {
        // Check if specified port is in use
        const portInUse = await isPortInUse(PORT);
        
        if (portInUse && !process.env.PORT) {
            // If default port is in use and no specific port was requested, find an available port
            console.log(`Port ${PORT} is already in use. Attempting to find an available port...`);
            PORT = await findAvailablePort(PORT + 1);
            console.log(`Found available port: ${PORT}`);
        }
        
        const server = app.listen(PORT)
            .on('error', (error) => {
                console.error('Server error:', error);
                process.exit(1);
            })
            .on('listening', () => {
                console.log(`Server is running on port ${PORT}`);
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
2. Choose a specific port by setting PORT environment variable
3. Wait a few seconds and try again`);
        process.exit(1);
    }
};

// Start the server
startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});