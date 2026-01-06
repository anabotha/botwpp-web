import { supabase } from "../config/supabaseClient.js";


export const getSimbolosDb = async () => {
     const { data, error } = await supabase.rpc("get_simbolos");

     if (error) {
          // En un servicio, lanzamos el error para que el controlador lo capture
          throw new Error(error.message);
     }

     // Retornamos los datos puros
     return data;
}
export const getSimbolosInteresDb = async () => {
     const { data, error } = await supabase
          .from('simbolos_interes')
          .select('activo, exchange, tipo')
          .eq('es_activo', true);

     if (error) {
          console.error("Error al traer simbolos de interes:", error.message);
          throw error;
     }
     return data;
};