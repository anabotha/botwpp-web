import dotenv from "dotenv";
dotenv.config();

import { enviarAlertaInversion } from "./wpp/api/enviarAlertaInversion.js";

// enviarAlerta("Alerta automática: inverti en ypf");
//aca iria el enviarAlertaInversion en caso de ser necesario

enviarAlerta=false;
// aca una function q evlaua
//paraemtros=funcion q da parametros
let parametros = {recomendacion: "Compra",
  activo: "APPLE",
  precio: "AAPL100",
  detalle: "STOCK MERCADO US 10% de suba en un dia"}
  if (parametros && enviar_alerta){
    enviarAlertaInversion(parametros);
  }
