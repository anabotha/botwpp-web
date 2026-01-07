import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'


serve(async (req) => {
  try {
    const { record } = await req.json()
    console.log("Procesando registro ID:", record?.id);

    // 1. Validar que el registro existe
    if (!record) throw new Error("No se recibió el objeto 'record'");

    // 2. Iniciamos el modelo gratuito
    const session = new Supabase.ai.Session('gte-small');

    // 3. Texto descriptivo (usando tus campos reales de la tabla operations)
    const content = `Operación ${record.tipo}: ${record.cantidad} de ${record.activo} a ${record.precio} ${record.moneda || 'ARS'}.`;

    // 4. Generar embedding
    const embedding = await session.run(content, { mean_pool: true, normalize: true });
    console.log("Vector generado con éxito");

    // 5. Conectar con Service Role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error } = await supabase.from('context_embeddings').insert({
      tipo: 'historial',
      content: content,
      embedding: embedding,
      metadata: { 
        operation_id: record.id,
        source: record.source 
      }
    });

    if (error) {
      console.error("Error al insertar en DB:", error.message);
      throw error;
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });

  } catch (err) {
    console.error("Error fatal en la función:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
})