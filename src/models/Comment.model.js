import mongoose, { Schema } from 'mongoose';

// export interface IComment extends Document {
//   content: string;
//   author: mongoose.Schema.Types.ObjectId;
//   post: mongoose.Schema.Types.ObjectId;
//   image: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

export const CommentSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Comment = mongoose.model('Comment', CommentSchema);