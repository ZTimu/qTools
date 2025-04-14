/**
 * Controller for view-related routes
 */

// Since we're now in a backend-only context, these methods should return JSON not views
const ViewController = {
    renderLogin: (req, res) => {
        // For backend API, just send a success message
        res.json({ message: 'Login API endpoint' });
    },

    renderRegister: (req, res) => {
        res.json({ message: 'Register API endpoint' });
    },

    renderDashboard: (req, res) => {
        res.json({ message: 'Dashboard API endpoint' });
    },

    renderPdfToWord: (req, res) => {
        res.json({ message: 'PDF to Word API endpoint' });
    },

    renderImageToText: (req, res) => {
        res.json({ message: 'Image to Text API endpoint' });
    },

    renderTemperatureMassConverter: (req, res) => {
        res.json({ message: 'Temperature Mass Converter API endpoint' });
    },

    renderQrGenerator: (req, res) => {
        res.json({ message: 'QR Generator API endpoint' });
    },

    renderCalculator: (req, res) => {
        res.json({ message: 'Calculator API endpoint' });
    },

    renderCurrencyConverter: (req, res) => {
        res.json({ message: 'Currency Converter API endpoint' });
    }
};

module.exports = ViewController;