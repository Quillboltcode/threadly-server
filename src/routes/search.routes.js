import express from 'express';
import { Post } from '../models/Post.model.js';

const router = express.Router();

/**
 * @swagger
 * /api/search/posts:
 *   get:
 *     summary: Search posts by keyword
 *     tags: [Searchs]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: Search query string (e.g., keyword in tags, content, or author name)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   content:
 *                     type: string
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                   author:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Server error
 */router.get('/posts', async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    try {
        // Query posts with search term
        const posts = await Post.find({
            $or: [
                { tags: { $regex: q, $options: 'i' } }, // Search in tags
                { content: { $regex: q, $options: 'i' } }, // Search in content
                { 'author.firstName': { $regex: q, $options: 'i' } }, // Search in author firstName
                { 'author.lastName': { $regex: q, $options: 'i' } }, // Search in author lastName
            ],
        })
            .limit(10) // Limit results to 10 for performance
            .populate('author', 'username email firstName lastName avatar'); // Populate author details

        res.status(200).json(posts);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;