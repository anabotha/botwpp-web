import { supabase } from "../config/supabaseClient.js";

export const storeAlertaInversion = async ({
  accion,
  activo,
  tipo_activo,
  mercado,
  precio,
  detalle,
  trading_day_id
}: any) => {

  if (!accion) {
    throw new Error("accion / tipo_recomendacion vacío");
  }

  const { error } = await supabase
    .from("alerts")
    .insert({
      activo,
      tipo_recomendacion: accion,
      tipo_activo,
      mercado,
      precio,
      detalle,
      trading_day_id
    });

  if (error) {
    console.error("Error al guardar alerta:", error.message);
    throw error;
  }
};

