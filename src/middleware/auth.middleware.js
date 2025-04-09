import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import dotenv from 'dotenv';
import { asyncHandler } from '../utils/AsyncHandler.js';

dotenv.config();
// password hash functions
export const hashPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const comparePassword = async (
  password,
  hashedPassword
)=> {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

// Configure Passport Strategies
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // 1. Check if user email exists in your database
    // 2. Create new user if they don't exist
    // 3. Return user object
    let user = await User.findOne({ email: profile.emails?.[0].value });
    if (!user) {
      user = new User({
        email: profile.emails?.[0].value,
        username: profile.displayName,
        avartar: profile.photos?.[0].value,
        provider: 'google',
        role: 'user'
        });
    };
    return done(null, {user, token: createToken(user._id.toString(), user.role)});
  } catch (error) {
    return done(error , undefined);
  }
}));

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    // Payload contains userId and role from createToken
    // put user id  and role in to req by decode jwt 
    const user = {
      _id: payload.userId,
      role: payload.role,
    };
    payload.user = user;
    return done(null, payload);
  } catch (error) {
    return done(error , undefined);
  }
}));

export const createToken = (userId, role)=> {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return token;
};

// Authentication middleware
export const authenticate = (strategy) => {
  return passport.authenticate(strategy, { scope:['profile','email'],session: false });
};

// Role-based authorization middleware
export const authorize = (roles) => {
  return asyncHandler(async(req, res, next) => {
    const user = req.user;
    
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  });
};

// Route handler
export const googleAuthCallback = (req, res) => {
  passport.authenticate('google', { session: false }, (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication failed' });
    }
    
    res.json({
      user: data.user,
      token: data.token
    });
  })(req, res);
};

// Initialize Passport middleware
export const initializePassport = (app) => {
  app.use(passport.initialize());
};