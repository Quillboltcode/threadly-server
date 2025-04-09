import { Router } from 'express';
import { getUserById, 
    followUser, 
    suggestions,
    getUserProfile,
    updateProfile
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';


const router = Router();
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     description: Get current user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 */router.get('/profile',  authenticate('jwt'), getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     description: Update current user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 */
router.put('/profile',  authenticate('jwt'), updateProfile);

/**
 * @swagger
 * /api/users/find/{id}:
 *   get:
 *     summary: Get user by id
 *     description: Get user by id
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not Found
 */router.get('/find/:id', authenticate('jwt'), getUserById );


/**
  * @swagger
  * /api/users/follow/{id}:
  *   post:
  *     summary: Follow a user
  *     description: Follow a user by their ID
  *     tags: [User]
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: string
  *         description: ID of the user to follow
  *     responses:
  *       200:
  *         description: Successfully followed user
  *       401:
  *         description: Unauthorized
  *       404:
  *         description: User not found
  */router.post('/follow/:id', authenticate('jwt'), followUser);
  
/**
 * @swagger
 * /api/users/suggestions:
 *   get:
 *     summary: Get user suggestions
 *     description: Get suggested users to follow
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */router.get('/suggestions', authenticate('jwt'), suggestions );

export default router;