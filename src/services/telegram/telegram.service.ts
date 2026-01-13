import "dotenv/config";
import { sendTelegramInvestmentAlert } from "../../services/telegram.service.js";
import { storeAlertaInversion } from "../../services/alerts.service.js";

export async function enviarAlertaInversionTelegram({
  recomendacion,
  activo,
  precio,
  detalle,
  mercado,
  guardarEnDB = true,
}: {
  recomendacion: string;
  activo: string;
  precio: string;
  detalle: string;
  mercado?: string;
  guardarEnDB?: boolean;
}) {
  try {
    // Enviar por Telegram
    await sendTelegramInvestmentAlert({
      recomendacion,
      activo,
      precio,
      detalle,
      mercado,
    });

    // Guardar en base de datos
//     if (guardarEnDB) {
//       await storeAlertaInversion({
//         accion: recomendacion,
//         activo,
//         tipo_activo: activo,
//         mercado: mercado || "No especificado",
//         precio,
//         detalle,
//       });
//     }

    return {
      success: true,
      message: "Alerta enviada a Telegram y guardada en base de datos",
    };
  } catch (error) {
    console.error("Error al enviar alerta de inversión por Telegram:", error);
    throw error;
  }
}
