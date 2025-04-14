const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Service layer for user-related operations
 */
class UserService {
  /**
   * Register a new user
   * @param {Object} userData User registration data
   * @returns {Promise<Object>} Newly created user (without password)
   */
  static async registerUser(userData) {
    try {
      // Check if user exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create new user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword
      });

      await user.save();
      
      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;
      
      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Authenticate a user and generate JWT token
   * @param {string} email User email
   * @param {string} password User password
   * @returns {Promise<Object>} Authentication data including token
   */
  static async loginUser(email, password) {
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const payload = {
        user: {
          id: user.id
        }
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );

      // Return user data without password
      const userResponse = user.toObject();
      delete userResponse.password;
      
      return {
        user: userResponse,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {string} userId User ID
   * @returns {Promise<Object>} User data (without password)
   */
  static async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService; 