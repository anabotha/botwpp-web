import { Router } from 'express';
import { getAllEmbeddings } from '../controllers/embeddings.controller';

const router = Router();

// Ahora la URL será: /api/db/embeddings
router.get('/embeddings', getAllEmbeddings);

export default router;