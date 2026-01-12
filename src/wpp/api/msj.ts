// enviarAlerta.js

async function enviarAlerta(texto:string) {

  const url = `https://graph.facebook.com/v20.0/${ WHATSAPP_BUSINESS_PHONE_NUMBER_ID}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: WHATSAPP_USER_PHONE_NUMBER,
      type: "text",
      text: { body: texto }
    })
  });

  const data = await res.json();
  console.log("Respuesta de WhatsApp:", data);

  return data;
}

export { enviarAlerta };
