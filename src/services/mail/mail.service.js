import { resend } from "./resend.client.js";
import { alertaInversionTemplate } from "./alert.template.js";

// export async function enviarAlertaInversionMail(data) {
//   console.log("enviar alerta mail!");
//   console.log(process.env.RESEND_API_KEY)
//   return resend.emails.send({
//     from: "Bot Inversiones <onboarding@resend.dev>",
//     to: "josefinabotha@gmail.com",
//     subject: "Alerta de inversión",
//     html: alertaInversionTemplate(data),
//   });
// }

export async function enviarAlertaInversionMail(data) {
  console.log("Intentando enviar mail...");

  try {
    const result = await resend.emails.send({
      from: "Bot <onboarding@resend.dev>",
      to: "mauriciobarraa41@gmail.com",
      subject: "Alerta de inversión",
      html: alertaInversionTemplate(data),
    });

    console.log("Resultado Resend:", result);
    return result;

  } catch (error) {
    console.error("Error enviando mail:", error);
    throw error;
  }
}

