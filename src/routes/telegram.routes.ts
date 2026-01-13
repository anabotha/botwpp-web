import { Router } from "express";
import { enviarAlertaInversionTelegram } from "../services/telegram/telegram.service.js";

const router = Router();

/**
 * POST /api/telegram/alerta-inversion
 * Envía una alerta de inversión a Telegram
 */
router.post("/alerta-inversion", async (req, res) => {
  try {
    const { recomendacion, activo, precio, detalle, mercado } = req.body;

    if (!recomendacion || !activo || !precio || !detalle) {
      return res.status(400).json({
        success: false,
        error: "Campos requeridos faltantes",
        required: ["recomendacion", "activo", "precio", "detalle"],
      });
    }



    const result = await enviarAlertaInversionTelegram({
      recomendacion: recomendacion.toUpperCase(),
      activo: activo.toUpperCase(),
      precio,
      detalle,
      mercado,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error en ruta de Telegram:", error);
    res.status(500).json({
      success: false,
      error: "Error al enviar alerta de inversión",
      message: error.message,
    });
  }
});

/**
 * POST /api/telegram/test
 * Envía un mensaje de prueba a Telegram
 */
router.post("/test", async (req, res) => {
  try {
    const result = await enviarAlertaInversionTelegram({
      recomendacion: "COMPRA",
      activo: "TEST",
      precio: "100.00",
      detalle: "🚀 Prueba exitosa de conexión a Telegram",
      mercado: "Test",
    });

    res.status(200).json({
      success: true,
      message: "Mensaje de prueba enviado a Telegram correctamente",
      result,
    });
  } catch (error: any) {
    console.error("Error en prueba de Telegram:", error);
    res.status(500).json({
      success: false,
      error: "Error al enviar mensaje de prueba",
      message: error.message,
    });
  }
});

export default router;
