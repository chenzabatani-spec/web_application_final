import express from 'express';
import aiController from '../controllers/ai_controller';

const router = express.Router();

router.get('/test-embedding', aiController.testEmbedding);

/**
 * @swagger
 * /ai/search:
 *   post:
 *     summary: Perform semantic search on posts based on meaning
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: Free text search query
 *                 example: "Looking for a good place to eat pasta in Italy"
 *     responses:
 *       200:
 *         description: Search completed successfully
 *       400:
 *         description: Missing search query
 *       500:
 *         description: Failed to perform semantic search
 */
router.post('/search', aiController.search);

export default router;