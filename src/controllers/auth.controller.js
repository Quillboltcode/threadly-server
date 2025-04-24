import { User } from '../models/User.model.js';
import { hashPassword, comparePassword, createToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { sanitizeUser } from '../utils/sanitizerObj.js';
import jwt from 'jsonwebtoken';


export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  // Check if the user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
     res.status(409).json({ message: 'User already exists' } );
     return;
  }
  // Hash the password
  const hashedPassword = await hashPassword(password);
  // Create a new user
  const newUser = new User({ username, email, password: hashedPassword });
  const savedUser = await newUser.save();

  // Generate a JWT token
  const token = createToken(savedUser._id.toString(), savedUser.role);

  // Send the token in the response 
  res.status(201).json({token, user:sanitizeUser(savedUser) });
  return;
});

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validate the request body
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    // Check if the user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }
    // Check if the password is correct
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate a JWT token
    const token = createToken(user._id.toString(), user.role);
    // Send the token in the response
    res.status(200).json({ token, user:sanitizeUser(user) });
    return ;
    }   catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
}




export const logout = async (req, res) => {
  try {
    // Clear the token from the client
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

