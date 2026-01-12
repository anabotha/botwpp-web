import { Router } from 'express';
import { getPriceEtf } from '../services/marketData.service.js';

const router = Router();

router.get('/etf/:symbol', async (req, res) => {
     try {
          const { symbol } = req.params;
          const { exchange } = req.query;

          const data = await getPriceEtf(symbol, exchange as string);
          return res.json(data);
     } catch (error) {
          return res.status(500).json({ error: 'Error al consultar mercado' });
     }
});

export default router;