import "dotenv/config";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export const sendTelegramMessage = async (message: string) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configurados");
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`Error de Telegram: ${JSON.stringify(error)}`);
    }

    const data = await res.json();
    console.log("Mensaje enviado a Telegram:", data.result.message_id);
    return data;
  } catch (error) {
    console.error("Error al enviar mensaje a Telegram:", error);
    throw error;
  }
};

export const sendTelegramInvestmentAlert = async ({
  recomendacion,
  activo,
  precio,
  detalle,
  mercado,
}: {
  recomendacion: string;
  activo: string;
  precio: string;
  detalle: string;
  mercado?: string;
}) => {
  const formattedMessage = `
<b>ALERTA DE INVERSIÓN</b>

<b>Recomendación:</b> ${recomendacion}
<b>Activo:</b> ${activo}
<b>Precio:</b> ${precio}
${mercado ? `<b>Mercado:</b> ${mercado}` : ""}

<b>Detalle:</b>
${detalle}

---
${new Date().toLocaleString("es-AR")}
  `.trim();

  return sendTelegramMessage(formattedMessage);
};
