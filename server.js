// server.js
// Los cron jobs se configuran en render.yaml para Render con plan pago
// No usar node-cron en este contexto

// Tu app Express continúa normal
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});