import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function searchContextByEmbedding(
  queryEmbedding: number[],
  options?: {
    tipo?: string;
    limit?: number;
    minSimilarity?: number;
  }
) {
  const {
    tipo,
    limit = 5,
    minSimilarity = 0.7
  } = options || {};

  let query = supabase.rpc("match_context_embeddings", {
    query_embedding: queryEmbedding,
    match_count: limit,
    match_tipo: tipo ?? null
  });

  const { data, error } = await query;

  if (error) {
    throw new Error("Vector search failed: " + error.message);
  }

  return data.filter((d: any) => d.similarity >= minSimilarity);
}
