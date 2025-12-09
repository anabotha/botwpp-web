// enviarAlerta.js
// import fetch from "node-fetch";

async function enviarAlerta(texto) {
  const phoneNumberId = "911908612005498"; // WHATSAPP BUSINESS PHONE NUMBER ID
  const token = "EAASfkfsWSJ4BQHWTyb7pQvU9F9j9WJCj8KmEZCmq5oehqvqsL5cXHd56KX5tyiu3hunqY7WWQqOETxeAjdI1rsVsr00P1dXGhXlUZB8BtrmWI3QYTl0BHXqD7poOJcoktCRZAvebCRJC9XwHP3oawZC4n3hNjQ8ZCZCjppQikngovCaV6MOJTdcj3hLNzBPam3Y0R9xCQbSykb9biVXYJZAU3XUBA3ERW6DU9dJ19KZBGE5wODgXp7714JCZBsdMYGX4mXZBbyoEUaOMpe7OclemDZCsgZDZD";           // TOKEN DE META
  const numeroDestino = "+542974330185";   // NUMERO DEL USUARIO

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: numeroDestino,
      type: "text",
      text: { body: texto }
    })
  });

  const data = await res.json();
  console.log("Respuesta de WhatsApp:", data);

  return data;
}

export { enviarAlerta };
