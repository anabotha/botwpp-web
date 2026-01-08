import { supabase } from "../config/supabaseClient.js";

export const storeAlertaInversion = async ({
  activo,
  tipo_recomendacion,
  tipo_activo,
  mercado,
  precio,
  detalle,
  trading_day_id
}: any) => {
const { error } = await supabase
    .from("alerts")
    .insert({
      activo,
      tipo_recomendacion,
      tipo_activo,
      mercado,
      precio,
      detalle,
      trading_day_id
    });

  if (error) {
    console.error("Error al guardar alerta:", error.message);
    throw new Error("No se pudo guardar la alerta");
  }
};
