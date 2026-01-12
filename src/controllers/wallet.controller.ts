

// src/controllers/wallet.controller.ts
import * as walletService from '../services/wallet.service.js';

export const getArsBalance = async (req, res) => {
     try {
          const data = await walletService.getTotalArs();
          res.json(data);
     } catch (err) {
          res.status(500).json({ error: err.message });
     }
};
export const getUsdBalance = async (req, res) => {
     try {
          const data = await walletService.getTotalUsd();
          res.json(data);
     } catch (err) {
          res.status(500).json({ error: err.message });
     }
};