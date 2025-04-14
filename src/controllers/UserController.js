const UserService = require('../services/UserService');

class UserController {
    // Register a new user
    async register(req, res) {
        try {
            const user = await UserService.createUser(req.body);
            const { token } = await UserService.authenticateUser(req.body.email, req.body.password);
            res.status(201).json({ token });
        } catch (error) {
            console.error(error);

            // Check if the error is related to user already existing
            if (error.message === 'User already exists') {
                return res.status(400).json({ error: 'User already registered' });  // Send 400 if user exists
            }

            // General server error handling
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { token } = await UserService.authenticateUser(email, password);
            res.json({ token });
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: 'Invalid credentials' });
        }
    }

    // Logout user
    async logout(req, res) {
        try {
            // Clear the token cookie or session
            // If using JWT, we can't invalidate the token on the server side
            // but we can clear it from the client side
            res.redirect('/login');
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Get user profile
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }
}

module.exports = new UserController();
