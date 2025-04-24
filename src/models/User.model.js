import mongoose, { Document, Schema } from 'mongoose';

// export interface IUser extends Document {
//   username: string;
//   email: string;
//   password: string;
//   firstName?: string;
//   lastName?: string;
//   avatar?: string;
//   bio?: string;
//   isVerified: boolean;
//   role: 'user' | 'admin' | 'moderator';
//   followers: mongoose.Types.ObjectId[];
//   following: mongoose.Types.ObjectId[];
//   resetPasswordToken?: string;
//   resetPasswordExpire?: Date;
//   verificationToken?: string;
//   lastLogin?: Date;
//   isActive: boolean;
//   Provider: string;
//   createdAt: Date;
//   updatedAt: Date;

// }

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    maxlength: [50, 'Username cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  // password can be optional if using OAuth
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  firstName: String,
  lastName: String,
  avatar: String,
  bio: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verificationToken: String,
  lastLogin: Date,
  Provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});


export const User = mongoose.model('User', UserSchema);
