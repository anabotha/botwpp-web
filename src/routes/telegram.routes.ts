import { Router } from "express";
import {
  telegramInvestmentController,
  telegramTestController,
} from "../controllers/telegram.controller.js";

const router = Router();

/**
 * POST /api/telegram/alerta-inversion
 * Envía una alerta de inversión a Telegram
 */
router.post("/alerta-inversion", telegramInvestmentController);

/**
 * POST /api/telegram/test
 * Envía un mensaje de prueba a Telegram
 */
router.post("/test", telegramTestController);

export default router;
