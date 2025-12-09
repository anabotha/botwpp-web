curl -X POST \
  https://graph.facebook.com/v20.0/123456789012345/messages \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "54911XXXXXXXX",
    "type": "template",
    "template": {
      "name": "alerta",
      "language": { "code": "es" },
      "components": [
          {
          "type": "header",
          "parameters": [
            { "type": "text", "text": "HEADER_TEXT_PARAM" }
          ]
          },
        {
          "type": "body",
          "parameters": [
            { "type": "text", "text": "BODY_TEXT_PARAM_1" },
            { "type": "text", "text": "BODY_TEXT_PARAM_2" }
          ]
        }
      ]
    }
  }'
