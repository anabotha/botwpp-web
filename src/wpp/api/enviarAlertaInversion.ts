import "dotenv/config";
import { enviarAlertaInversionMail } from "../../services/mail/mail.service.js";
import {storeAlertaInversion} from "../../services/alerts.service.js";
// export async function enviarAlertaInversion({
//   recomendacion,
//   activo,
//   precio,
//   detalle
// }) {

//   const WHATSAPP_BUSINESS_PHONE_NUMBER_ID = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID;
//   const WHATSAPP_TOKEN_ACCESS = process.env.WHATSAPP_TOKEN_ACCESS;
//   const WHATSAPP_USER_PHONE_NUMBER = process.env.WHATSAPP_USER_PHONE_NUMBER;

//   const url = `https://graph.facebook.com/v20.0/${WHATSAPP_BUSINESS_PHONE_NUMBER_ID}/messages`;

//   const res = await fetch(url, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${WHATSAPP_TOKEN_ACCESS}`,
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       messaging_product: "whatsapp",
//       to: WHATSAPP_USER_PHONE_NUMBER,
//       type: "template",
//       template: {
//         name: "alerta_de_inversion",
//         language: { code: "es_AR" },
//         components: [
//           {
//             type: "header",
//             parameters: []
//           },
//           {
//             type: "body",
//             parameters: [
//               { type: "text", text: recomendacion },
//               { type: "text", text: activo },
//               { type: "text", text: precio },
//               { type: "text", text: detalle }
//             ]
//           }
//         ]
//       }
//     })
//   });

//   const data = await res.json();
//   console.log("Respuesta WhatsApp:", data);
//   return data;
// }


export async function enviarAlertaInversion({
  recomendacion,
  activo,
  tipo_activo,
  precio,
  monto_sug,
  detalle,
  mercado,
  accion
}: {
  recomendacion: string;
  activo: string;
  tipo_activo: string;
  precio: string;
  monto_sug: string;
  detalle: string;
  mercado: string;
  accion: string;
}  
) {
// console.log("llega a  alerta inversion")

// console.log("Alerta enviada");
  console.log(recomendacion);
  console.log(tipo_activo);
  console.log(monto_sug);

//   console.log(activo);
//   console.log(precio);
//   console.log(detalle);
//   console.log(mercado);

//  console.log("Enviando alerta inversión:");

  await enviarAlertaInversionMail({recomendacion,activo,tipo_activo,precio,monto_sug,detalle,mercado});
  //enviar alerta por whatsapp.
  //almacenar alerta en base de datos.
 await storeAlertaInversion({
  accion,
  activo,
  tipo_activo,
  mercado,
  precio,
  detalle
  // ,trading_day_id
});

  // console.log("Alerta enviada correctamente");

}
