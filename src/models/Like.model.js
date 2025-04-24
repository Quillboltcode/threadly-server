import mongoose, { Schema } from 'mongoose';

// export interface ILike extends Document {
//   post: mongoose.Schema.Types.ObjectId;
//   user: mongoose.Schema.Types.ObjectId;
//   createdAt: Date;
// }

const LikeSchema = new Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique likes
LikeSchema.index({ post: 1, user: 1 }, { unique: true });

export const Like = mongoose.model('Like', LikeSchema);
