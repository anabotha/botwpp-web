import { Request, Response } from 'express';
import * as marketService from '../services/market.service.js';
import { getPriceCommonStock } from '../services/marketData.service.js';

export const getPriceHandler = async (req: Request, res: Response) => {
     try {
          const { simbolo } = req.params;
          const { exchange } = req.query;
          // El controlador solo pasa datos al servicio
          const data = await getPriceCommonStock(simbolo, exchange as string);
          res.json(data);
     } catch (error) {
          res.status(500).json({ error: "Error al obtener precio" });
     }
};

export const triggerEvaluacion = async (req: Request, res: Response) => {
     try {
          const resultado = await marketService.ejecutarEvaluacionMercado();
          res.json(resultado);
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
};