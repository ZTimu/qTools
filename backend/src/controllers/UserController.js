const UserService = require('../services/UserService');

class UserController {
    // Register a new user
    async register(req, res) {
        try {
            const userData = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            };
            
            // Register the user
            const user = await UserService.registerUser(userData);
            
            // Login the user after successful registration
            const authResult = await UserService.loginUser(req.body.email, req.body.password);
            
            res.status(201).json({ 
                token: authResult.token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Registration error:', error.message);

            // Check for specific errors
            if (error.message === 'User already exists') {
                return res.status(400).json({ error: 'User already registered' });
            }

            // General server error
            res.status(500).json({ error: 'Server error during registration' });
        }
    }

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const authResult = await UserService.loginUser(email, password);
            
            res.json({ 
                token: authResult.token,
                user: {
                    id: authResult.user._id,
                    name: authResult.user.name,
                    email: authResult.user.email
                }
            });
        } catch (error) {
            console.error('Login error:', error.message);
            
            // Return appropriate error status
            if (error.message === 'Invalid credentials') {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
            
            res.status(500).json({ error: 'Server error during login' });
        }
    }

    // Logout user (for JWT just send success - token handling is client-side)
    async logout(req, res) {
        res.json({ success: true, message: 'Logout successful' });
    }

    // Get user profile
    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await UserService.getUserById(userId);
            
            res.json({
                id: user._id,
                name: user.name,
                email: user.email
            });
        } catch (error) {
            console.error('Get profile error:', error.message);
            res.status(500).json({ error: 'Error retrieving user profile' });
        }
    }
}

module.exports = new UserController();
