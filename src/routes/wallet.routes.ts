// src/routes/wallet.routes.ts
import { Router } from 'express';
import { getArsBalance } from '../controllers/wallet.controller';

const router = Router();
router.get('/total-ars', getArsBalance);
export default router;