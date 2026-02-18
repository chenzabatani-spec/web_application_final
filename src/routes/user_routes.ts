import express from 'express';
import userController from '../controllers/user';
import authMiddleware from '../middleware/auth_middleware';

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
router.get('/', authMiddleware, userController.getAll.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server Error
 */
router.get('/:id', authMiddleware, userController.getById.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user details
 *     description: Update user profile (username, imgUrl). Only the owner can update their profile.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               imgUrl:
 *                 type: string
 *             example:
 *               username: "NewNickName"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - You can only update your own profile
 *       404:
 *         description: User not found
 *       500:
 *         description: Server Error
 */
router.put('/:id', authMiddleware, userController.update.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Delete a user account. Only the owner (or admin) can delete the account.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - You can only delete your own account
 *       404:
 *         description: User not found
 *       500:
 *         description: Server Error
 */
router.delete('/:id', authMiddleware, userController.delete.bind(userController));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: This route is disabled. Please use /auth/register to create a new user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       405:
 *         description: Method Not Allowed
 */
router.post("/", authMiddleware, userController.create.bind(userController));

export default router;