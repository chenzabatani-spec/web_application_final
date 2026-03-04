import express from 'express';
import aiController from '../controllers/ai_controller';

const router = express.Router();

router.get('/test-embedding', aiController.testEmbedding);

export default router;