
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { sanitizeUser } from '../utils/sanitizerObj.js';


// Get current user's profile
export const getUserProfile = asyncHandler(
  async (req, res) => {
    const userId = req.user.userId || req.user._id || req.user.user?._id;
    console.log('get profile run')
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // limit return by remove info and remove _id and _v and role and createdAt and updatedat


    res.status(200).json({user:sanitizeUser(user)});
  }
);

// Update user profile
export const updateProfile = asyncHandler(
  async (req, res) => {
    console.log("Update profile run")
    const userId = req.user.userId || req.user._id || req.user.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({user:sanitizeUser(updatedUser)});
  }
);

// Get user by ID
export const getUserById = asyncHandler(
  async (req, res) => {
    console.log("Get user by ID run")
    const userId = req.user.userId || req.user._id || req.user.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({user:sanitizeUser(user)});
  }
);

// Follow/Unfollow user
export const followUser = asyncHandler(async (req, res) => {
  const userId = req.user.userId || req.user._id || req.user.user?._id;
  console.log("Follow user run")
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing" });
  }

  const userToFollow = await User.findById(req.params.id);
  if (!userToFollow) {
    return res.status(404).json({ message: "User not found" });
  }
  
 
  const isFollowing = await User.exists({ _id: userId, following: userToFollow._id });
  const bulkOperations = [];
  if (isFollowing) {
    // Unfollow
    bulkOperations.push(
      { updateOne: { filter: { _id: userId }, update: { $pull: { following: userToFollow._id } } } },
      { updateOne: { filter: { _id: userToFollow._id }, update: { $pull: { followers: userId } } } }
    );
  } else {
    // Follow
    bulkOperations.push(
      { updateOne: { filter: { _id: userId }, update: { $addToSet: { following: userToFollow._id } } } },
      { updateOne: { filter: { _id: userToFollow._id }, update: { $addToSet: { followers: userId } } } }
    );
  }

  await User.bulkWrite(bulkOperations);

  // Fetch updated following list with selected fields
  const updatedUser = await User.findById(userId).select("following").populate({
    path: "following",
    select: "username avatar firstName lastName isVerified"
  });

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found after follow/unfollow action" });
  }
  
  res.status(200).json({
    message: isFollowing ? "User unfollowed successfully" : "User followed successfully",
    following: updatedUser.following
  });
});


// Get user suggestions
export const suggestions = asyncHandler(async (req, res) => {
  const userId = req.user.userId || req.user._id || req.user.user?._id;
  console.log('Get suggestions run')

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing" });
  }
  try{
    const currentUser = await User.findById(userId).select('following');
    const followingIds = currentUser.following.map(id => id.toString());

    // Fetch suggested users
    const suggestedUsers = await User.find({
      _id: { $nin: followingIds },
      isActive: true,
      role: 'user'
    })
    .select('username avatar bio followers')
    .sort({ followers: -1 })
    .limit(10);

    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});



