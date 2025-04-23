import { Router } from 'express';
import {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getMostFrequentTag
} from '../controllers/post.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { handleCommentImage, handlePostImages } from '../middleware/upload.middleware.js';


const router = Router();
//-----------------------------------------------------------------------------------------------------------------------------
// public routes
/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts with pagination
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
 *       204:
 *         description: No posts available
 */router.get('/', getAllPosts);

/**
  * @swagger
  * /api/posts/single/{id}:
  *   get:
  *     summary: Get a single post by ID
  *     tags:
  *       - Posts
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: string
  *     responses:
  *       200:
  *         description: Post retrieved successfully
  *       404:
  *         description: Post not found
  * 
  *   put:
  *     summary: Update a post
  *     tags:
  *       - Posts
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         description: Post ID
  *         schema:
  *           type: string
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             required:
  *               - content
  *             properties:
  *               content:
  *                 type: string
  *                 description: Updated post content
  *     responses:
  *       200:
  *         description: Post updated successfully
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/Post'
  *       403:
  *         description: Unauthorized to update this post
  *       404:
  *         description: Post not found
  */router.get('/single/:id', getPost);

/**
 * @swagger
 * /api/posts/tags:
 *   get:
 *     summary: Get the most common tags from posts
 *     description: Returns the top 10 most frequently used tags in posts.
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of the most common tags.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tag:
 *                     type: string
 *                     example: "travel"
 *                   count:
 *                     type: integer
 *                     example: 15
 *       500:
 *         description: Internal server error
 */router.get('/tags', getMostFrequentTag);


/**************************************************************************************************** */
// private routes

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Post content
 *                 example: "This is my first post!"
 *               images:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */router.post('/',authenticate('jwt'), handlePostImages, createPost);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       403:
 *         description: Unauthorized to update this post
 *       404:
 *         description: Post not found
 */router.put('/:id', authenticate('jwt'), handlePostImages, updatePost);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       403:
 *         description: Unauthorized to delete this post
 *       404:
 *         description: Post not found
 */
router.delete('/:id', authenticate('jwt'), deletePost);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Toggle like on a post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       403:
 *         description: Unauthorized to like this post
 *       404:
 *         description: Post not found
 */router.post('/:id/like', authenticate('jwt'), toggleLike);


/**
  * @swagger
  * /api/posts/{id}/comment:
  *   post:
  *     summary: Add a comment to a post
  *     tags:
  *       - Posts
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         description: Post ID
  *         schema:
  *           type: string
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               content:
  *                 type: string
  *                 description: The content of the comment
  *     responses:
  *       201:
  *         description: Comment added successfully
  *       403:
  *         description: Unauthorized to comment on this post
  *       404:
  *         description: Post not found
  */router.post('/:id/comment', authenticate('jwt'),handleCommentImage, addComment);
export default router;