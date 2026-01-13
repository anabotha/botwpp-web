# 📱 Integración Telegram - Alertas de Inversión

## Configuración

Para habilitar el envío de alertas de inversión a través de Telegram, necesitas configurar dos variables de entorno en tu archivo `.env`:

```env
# Telegram Bot Token
# Obtén esto de @BotFather en Telegram
TELEGRAM_BOT_TOKEN=tu_bot_token_aqui

# Tu Chat ID en Telegram
# Puedes obtenerlo enviando un mensaje a tu bot y llamando a:
# https://api.telegram.org/botTU_BOT_TOKEN/getUpdates
TELEGRAM_CHAT_ID=tu_chat_id_aqui
```

### Pasos para obtener el Bot Token:

1. Abre Telegram y busca **@BotFather**
2. Inicia una conversación y escribe `/start`
3. Escribe `/newbot` y sigue los pasos
4. Recibirás un token: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`
5. Copia este token en `TELEGRAM_BOT_TOKEN`

### Pasos para obtener el Chat ID:

1. Crea un grupo privado o usa un chat directo con el bot
2. Envía un mensaje al bot
3. Abre esta URL en tu navegador (reemplazando con tu token):
   ```
   https://api.telegram.org/botTU_BOT_TOKEN/getUpdates
   ```
4. Busca `"chat":{"id":123456789}` - ese número es tu `TELEGRAM_CHAT_ID`

## API

### Enviar Alerta de Inversión

**Endpoint:** `POST /api/telegram/alerta-inversion`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "recomendacion": "COMPRA",
  "activo": "YPFD",
  "precio": "3.500",
  "detalle": "La acción presenta un patrón de rebote en la media móvil de 20 días...",
  "mercado": "Bolsa"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alerta enviada a Telegram y guardada en base de datos"
}
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/api/telegram/alerta-inversion \
  -H "Content-Type: application/json" \
  -d '{
    "recomendacion": "COMPRA",
    "activo": "YPFD",
    "precio": "3.500",
    "detalle": "La acción presenta un patrón de rebote en la media móvil de 20 días",
    "mercado": "Bolsa"
  }'
```

## Uso desde el Código

### Desde TypeScript/JavaScript:

```typescript
import { enviarAlertaInversionTelegram } from "./src/telegram/api/enviarAlertaInversion.js";

// Enviar alerta
await enviarAlertaInversionTelegram({
  recomendacion: "VENTA",
  activo: "MERVAL",
  precio: "2.845",
  detalle: "Índice ha perdido soporte en 2.850 puntos...",
  mercado: "Bolsa",
  guardarEnDB: true // Opcional, por defecto true
});
```

### Servicio de Telegram de bajo nivel:

```typescript
import { sendTelegramMessage, sendTelegramInvestmentAlert } from "./src/services/telegram.service.js";

// Mensaje simple
await sendTelegramMessage("Tu mensaje aquí");

// Mensaje formateado como alerta de inversión
await sendTelegramInvestmentAlert({
  recomendacion: "COMPRA",
  activo: "TSLA",
  precio: "250.50",
  detalle: "Análisis técnico positivo",
  mercado: "NASDAQ"
});
```

## Características

✅ Envío de alertas de inversión formateadas en HTML
✅ Almacenamiento automático en base de datos (Supabase)
✅ Integración con rutas Express
✅ Manejo de errores robusto
✅ Timestamps en horario local Argentina (es-AR)
✅ Compatible con el servicio de alertas existente

## Archivos Creados

- `src/services/telegram.service.ts` - Servicio de Telegram
- `src/telegram/api/enviarAlertaInversion.ts` - API de alertas
- `src/routes/telegram.routes.ts` - Rutas Express

## Estructura de la Alerta en Telegram

La alerta se mostrará en Telegram con este formato:

```
🚀 ALERTA DE INVERSIÓN

Recomendación: COMPRA
Activo: YPFD
Precio: 3.500
Mercado: Bolsa

Detalle:
La acción presenta un patrón de rebote en la media móvil de 20 días...

---
13/1/2026, 14:30:45
```

## Próximos Pasos (Opcional)

Podrías integrar esto con:
- El jobScheduler para enviar alertas automáticas
- El evaluador de mercado para notificaciones en tiempo real
- El servicio de alertas por mail para una estrategia multi-canal
