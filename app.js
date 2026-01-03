//habilita cors de la web de acciones
import express from "express";
import cors from "cors";

const app = express();

/* middlewares */
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",      // Vite
      "https://webacciones.vercel.app/"   // Producción
    ],
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);

/* routes */
import routes from "./routes/index.js";
app.use("/api", routes);

/* listen */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Bot WPP running on ${PORT}`);
});
