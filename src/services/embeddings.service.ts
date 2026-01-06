import { supabase } from "../config/supabaseClient.js";

export const getContextEmbeddings = async () => {
     const { data, error } = await supabase
          .from("context_embeddings")
          .select("*");

     if (error) {
          throw new Error(error.message);
     }

     return data;
};