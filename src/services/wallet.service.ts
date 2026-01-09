import { supabase } from "../config/supabaseClient.js";


// src/services/wallet.service.ts
export const getTotalArs = async () => {
     const { data, error } = await supabase.rpc("get_disponible_ars");
     // console.log(data)
     if (error) throw error;
     return data;
};
// src/services/wallet.service.ts
export const getTotalUsd = async () => {
     const { data, error } = await supabase.rpc("get_disponible_usd");
     if (error) throw error;
     return data;
};

