import { supabase } from "../config/supabaseClient.js";

export interface SimboloInteres{
  activo: string;
  exchange: string;
  tipo: string;
}
export const getSimbolosDb = async () => {
     const { data, error } = await supabase.rpc("get_simbolos");

     if (error) {
          // En un servicio, lanzamos el error para que el controlador lo capture
          throw new Error(error.message);
     }

     // Retornamos los datos puros
     return data;
}
export const getSimbolosInteresDb = async (): Promise<SimboloInteres[]> => {
  const { data, error } = await supabase
    .from('simbolos_interes')
    .select('activo, exchange, tipo')
    .eq('es_activo', true);

  if (error) {
    console.error('Error al traer símbolos de interés:', error.message);
    throw error;
  }

  return data ?? [];
};

export const getRecentRecommendationsDb = async (limit: number ): Promise<any[]> => {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(limit);
if (error) {
    console.error('Error al traer ultimas recomendaciones:', error.message);
    throw error;
  }

  return data ?? [];
}