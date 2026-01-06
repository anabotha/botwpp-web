import { Router } from 'express';
import { getSimbolosDb } from '../services/db.service';
import { getPriceCommonStock } from '../services/marketData.service';

const router = Router();

// Ruta para símbolos
router.get('/simbolos', async (req, res) => {
     try {
          const data = await getSimbolosDb();
          res.json(data);
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
});

// Ruta para precios
router.get('/precio/:simbolo', async (req, res) => {
     try {
          const { simbolo } = req.params;
          const { exchange } = req.query;
          const data = await getPriceCommonStock(simbolo, exchange as string);
          res.json(data);
     } catch (error) {
          res.status(500).json({ error: "Error al obtener precio" });
     }
});

export default router;