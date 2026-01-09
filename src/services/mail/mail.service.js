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

// export async function enviarAlertaInversionMail(data) {
//   // console.log("Intentando enviar mail...");

//   try {
//     const result = await resend.emails.send({
//       from: "Bot <onboarding@resend.dev>",
//       to: "mauriciobarraa41@gmail.com",
//       subject: "Alerta de inversión",
//       html: alertaInversionTemplate(data),
//     });

//     // console.log("Resultado Resend:", result);
//     return result;

//   } catch (error) {
//     console.error("Error enviando mail:", error);
//     throw error;
//   }
// }

import * as Brevo from '@getbrevo/brevo';

// 1. Instanciar directamente la clase necesaria
const apiInstance = new Brevo.TransactionalEmailsApi();

// 2. Configurar la API Key directamente en el cliente de la instancia
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export async function enviarAlertaInversionMail(data) {
  // 3. Usar el constructor de Brevo para el objeto de email
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "Alerta de inversión";
  sendSmtpEmail.sender = {
  name: "botinv",
  email: "mauriciobarraa41@gmail.com"
};

sendSmtpEmail.to = [
  { email: "josefinabotha@gmail.com", name: "zar de las finanzas" },
  { email: "yapurairina1@gmail.com", name: "Iri" },
  
];
// {email:"axelkevinagustinrojas@gmail.com",name:"axel"},
// {email:"facundovidal492@gmail.com",name:"facu"},

  sendSmtpEmail.htmlContent = alertaInversionTemplate(data);

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Correo enviado con éxito. ID:', result.body.messageId);
  } catch (error) {
    console.error('Error al enviar el correo de Brevo:', error);
  }
}
