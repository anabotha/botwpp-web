// server.js
const cron = require('node-cron');
const { ejecutarEvaluacion } = require('./controllers/jobs.controller.js');

// Cron job: cada 30 min de 9-18hs (ajustar timezone)
cron.schedule('*/30 9-18 * * *', async () => {
  console.log('🔄 Ejecutando evaluación programada...');
  try {
    await ejecutarEvaluacion();
    console.log('✅ Evaluación completada');
  } catch (error) {
    console.error('❌ Error en evaluación:', error);
  }
}, {
  timezone: "America/Argentina/Buenos_Aires"
});

// Tu app Express continúa normal
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});