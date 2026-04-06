import express, { RequestHandler } from 'express';
import postController from '../controllers/post';
import authMiddleware from '../middleware/auth_middleware';
import { upload } from './file_routes';


const router = express.Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Retrieve a list of posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: sender
 *         schema:
 *           type: string
 *         description: The sender ID to filter posts by. If left empty, returns all posts.
 *     responses:
 *       200:
 *         description: Successfully retrieved a list of posts
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Post'
 *       500:
 *        description: Server Error
 */
router.get('/', postController.getAll.bind(postController));

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *         example: 609e129e1c4ae12f34567890
 *     responses:
 *       200:
 *         description: The post description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server Error
 */
router.get('/:id', postController.getById.bind(postController));

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post with text and optional image
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Bad Request
 */
// הוספנו את upload.single('photo') לפני הקונטרולר
router.post('/', authMiddleware, upload.single('photo'), postController.create.bind(postController) as RequestHandler);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post (text or image)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post updated successfully
 */
router.put('/:id', authMiddleware, upload.single('photo'), postController.update.bind(postController));


/**
 * @swagger
 * /posts/{id}/like:
 *   patch:
 *     summary: Toggle like on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *         example: 609e129e1c4ae12f34567890
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.patch('/:id/like', authMiddleware, postController.toggleLike.bind(postController) as RequestHandler);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *         example: 609e129e1c4ae12f34567890
 *     responses:
 *       200:
 *         description: The post was deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server Error
 */
router.delete('/:id',authMiddleware, postController.delete.bind(postController));

export default router;