#!/usr/bin/env node

/**
 * QuickTools Application Launcher
 * 
 * This script serves as the main entry point for the QuickTools application.
 * It handles environment setup and server initialization.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Check if .env file exists, if not create one with defaults
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating default .env file...');
  const defaultEnv = `PORT=5000\nMONGODB_URI=mongodb://localhost:27017/quicktools\nJWT_SECRET=your-secret-key-change-this-in-production`;
  fs.writeFileSync(envPath, defaultEnv);
  console.log('.env file created with default values.');
}

// Display application banner
console.log('\n======================================');
console.log('       QuickTools Launcher       ');
console.log('======================================\n');
console.log('Starting application...');

// Start the server
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: { ...process.env }
});

// Handle server process events
server.on('close', (code) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code}`);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});