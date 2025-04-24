import { Post } from '../models/Post.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';

// Get most popular tags
export const getMostFrequentTag = async (req, res) => {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
      const result = await Post.aggregate([
        { $unwind: "$tags" }, // Flatten the tags array
        {
          $group: {
            _id: "$tags",
            count: { $sum: 1 } // Count occurrences
          }
        },
        { $sort: { count: -1 } }, // Sort by highest count
        { $limit: 5 } // Get the top 5 tags
      ]).exec(); // Ensure execution
  
      // console.log("Top Tags:", result);
  
  
      if (result.length === 0) {
        return res.status(200).json({ message: "No tags found for today." });
      }
  /* 
      res.status(200).json({ mostFrequentTag: result[0]._id, count: result[0].count }) */;
      res.status(200).json(result.map((tag) => ({ tag: tag._id, count: tag.count })));
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  
  
  export const searchByTag = asyncHandler(async (req, res) => {
    const tags = req.query.tags;
  
    // Validate input
    if (!tags) {
      return res.status(400).json({ message: "Tags query parameter is required" });
    }
  
    // console.log("Tags:", tags); // Debugging
    // console.log("Type of Tags:", typeof tags); // Debugging
  
    // Split the tags string into an array
    const tagArray = tags.split(',').map(tag => tag.trim());
  
    try {
      // Query posts where the `tags` array contains ALL elements of `tagArray`
      const results = await Post.find({
        tags: { $all: tagArray } // Use $all for exact matches
      });
  
      // console.log("Query Results:", results); // Debugging
  
      // Handle no results
      if (results.length === 0) {
        return res.status(404).json({ message: "No posts found with the given tags" });
      }
  
      // Return the results
      res.status(200).json({
        result: results.map(post => ({
          _id: post._id,
          content: post.content,
          author: post.author,
          tags: post.tags,
          image: post.image,
          createdAt: post.createdAt
        }))
      });
    } catch (error) {
      console.error("Error querying posts:", error); // Log the error
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });