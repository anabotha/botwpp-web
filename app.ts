// //habilita cors de la web de acciones
// import express from "express";
// import cors from "cors";

// const app = express();

// /* middlewares */
// app.use(express.json());

// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",      // Vite
//       "https://webacciones.vercel.app/"   // Producción
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE"]
//   })
// );

// /* routes */
// import routes from "./src/routes/jobs.routes.js";
// app.use("/api", routes);

// /* listen */
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`API Bot WPP running on ${PORT}`);
// });


import express from "express";
import cors from "cors";
import 'dotenv/config'; // Importante para cargar el CRON_SECRET y claves de API

// Importación de Rutas
import jobRoutes from "./src/routes/jobs.routes.js";
import dbRoutes from "./src/routes/db.routes.js"; // Para símbolos y embeddings
import marketRoutes from "./src/routes/market.routes.ts"; // Para precios y evaluación manual
import telegramRoutes from "./src/routes/telegram.routes.js"; // Para alertas por Telegram

const app = express();

/* Middlewares */
app.use(express.json());

// Configuración de CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://webacciones.vercel.app" // Quitamos la barra final para evitar errores de coincidencia
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"] // Permitimos el header de Auth para el Cron
  })
);

/* Routes Registry */
// Agrupamos por funcionalidad para que las URLs sean claras
app.use("/api/jobs", jobRoutes);     // Ejemplo: POST /api/jobs/run-evaluacion
app.use("/api/db", dbRoutes);         // Ejemplo: GET /api/db/simbolos
app.use("/api/market", marketRoutes); // Ejemplo: GET /api/market/precio/AAPL
app.use("/api/telegram", telegramRoutes); // Ejemplo: POST /api/telegram/alerta-inversion

/* Health Check (Opcional pero recomendado) */
app.get("/status", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

/* Listen */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // console.log(` API Bot Inversiones corriendo en puerto ${PORT}`);
  // console.log(`CORS habilitado para: http://localhost:5173 y Vercel`);
});