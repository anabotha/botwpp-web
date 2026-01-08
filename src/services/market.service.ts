import { getSimbolosDb, getSimbolosInteresDb } from "./db.service";
import { getPriceCommonStock, getPriceEtf } from "./marketData.service";
import { getTotalArs, getTotalUsd } from "./wallet.service";
import { getCedearsTodos, getLetrasTodas } from "./marketIOL.service";
import { runDecisionEngine } from "../ia/evaluator/decisionEngine";
import { listen } from "node:quic";

export const getAccionesIOL = async () => {
     console.log("getAccionesIol")
     // IOL suele devolver un objeto que contiene una lista llamada 'titulos'
     const dataCedears = await getCedearsTodos();
     const dataLetras = await getLetrasTodas();

     // Extraemos los arrays de títulos y los marcamos
     const cedears = (dataCedears.titulos || []).map((t: any) => ({ ...t, origen: "IOL_CEDEAR" }));
     const letras = (dataLetras.titulos || []).map((t: any) => ({ ...t, origen: "IOL_LETRA" }));

     return [...cedears, ...letras];
};

export const getAccionesTD = async (activos: [],simbolosInteres: any[]) => {
     const exchanges = ["NASDAQ", "NYSE"];
     let acciones: any[] = [];
     // activos = [...activos, ...simbolosInteres]
     console.log(`Iniciando evaluación para ${activos.length} activos.`);

     const mapaActivos = new Map();

     // Primero agregamos lo que ya tenemos (Prioridad)
     activos.forEach(s => {
          mapaActivos.set(s.activo, {
               ticker: s.activo,
               exchange: "NASDAQ", // O el que tengas por defecto para USA
               tipo: s.tipo_activo,
               poseido: true,
               cantidad: s.cantidad_total,
               costoPromedio: s.costo_promedio
          });
     });

     // Luego agregamos los de interés solo si NO están ya en el mapa
     simbolosInteres.forEach(s => {
          if (!mapaActivos.has(s.activo)) {
               mapaActivos.set(s.activo, {
                    ticker: s.activo,
                    exchange: s.exchange || "NASDAQ",
                    tipo: s.tipo_activo || "common_stock",
                    poseido: false,
                    cantidad: 0,
                    costoPromedio: 0
               });
          }
     });
     const listaFinal = Array.from(mapaActivos.values());

     let resultados: any[] = [];

     // 3. Bucle de consulta con Delay para Plan Free
     for (const item of listaFinal) {
          try {
               console.log(`Evaluando ${item.ticker} (${item.poseido ? 'En Portafolio' : 'Interés'})...`);

               let data;
               if (item.tipo === 'ETF') {
                    data = await getPriceEtf(item.ticker, item.exchange);
               } else {
                    data = await getPriceCommonStock(item.ticker, item.exchange);
               }

               if (data?.price) {
                    resultados.push({
                         simbolo: item.ticker,
                         precio: data.price,
                         exchange: item.exchange,
                         poseido: item.poseido,
                         cantidad: item.cantidad,
                         costoPromedio: item.costoPromedio,
                         tipoActivo: item.tipo
                    });
               }

               // Espera de 8 segundos para no exceder las 8 req/min de TwelveData Free
               await new Promise(resolve => setTimeout(resolve, 8200));

          } catch (error: any) {
               console.error(`Error en ${item.ticker}:`, error.message);
          }
     }

     return resultados;
};
//


// for (const s of activos) {
//      // CORRECCIÓN CLAVE: Extraemos el string del ticker
//      const ticker = typeof s === 'object' ? s.activo : s;
//      let encontrado = false;

//      for (const exch of exchanges) {
//           if (encontrado) break; // Si ya lo encontramos en NASDAQ, no lo buscamos en NYSE

//           try {
//                console.log(`Buscando ${ticker} en ${exch}...`);

//                // Intentamos ambos en paralelo para ahorrar tiempo, pero manejamos errores individualmente
//                const [resStock, resEtf] = await Promise.allSettled([
//                     getPriceCommonStock(ticker, exch),
//                     getPriceEtf(ticker, exch)
//                ]);

//                // Procesar Common Stock
//                if (resStock.status === "fulfilled" && resStock.value?.price) {
//                     acciones.push({
//                          simbolo: ticker,
//                          precio: resStock.value.price,
//                          exchange: exch,
//                          tipo: "Common Stock",
//                          cantidad: s.cantidad_total || 0 // Mantenemos el dato de tu DB
//                     });
//                     encontrado = true;
//                     console.log(`✅ ${ticker} encontrado como Acción`);
//                }

//                // Procesar ETF
//                if (resEtf.status === "fulfilled" && resEtf.value?.price) {
//                     acciones.push({
//                          simbolo: ticker,
//                          precio: resEtf.value.price,
//                          exchange: exch,
//                          tipo: "ETF",
//                          cantidad: s.cantidad_total || 0
//                     });
//                     encontrado = true;
//                     console.log(`✅ ${ticker} encontrado como ETF`);
//                }

//           } catch (e: any) {
//                // Solo logueamos si realmente es un error crítico, no si es un simple "not found"
//                console.log(`Nota: ${ticker} no disponible en ${exch} como ese tipo.`);
//           }
//      }
// }

// console.log(`Total de activos cotizados: ${acciones.length}`);
// return acciones;
// };
export function sampleRandom<T>(array: T[], n: number): T[] {
     return array
          .sort(() => Math.random() - 0.5)
          .slice(0, n);
}

export const ejecutarEvaluacionMercado = async () => {
     console.log("ejectura evaluaciokn mercado");
     let activos = await getSimbolosDb() ?? [];
     const simbolosInteres : any[] = await getSimbolosInteresDb() ?? [];

     const esDiaLaboral = () => {
          const day = new Date().getDay();
          return day !== 0 && day !== 6;
     };

     if (!esDiaLaboral()) return { message: "Mercado cerrado" };

     const [getArs, getUsd] = await Promise.all([getTotalArs(), getTotalUsd()]);
     const totalMoney = {
          ars: getArs ?? 0,
          usd: getUsd ?? 0
     };
     console.log(totalMoney)

     const simbolosSet = new Set([
          ...activos.map(a => String(a.activo ?? a).trim().toUpperCase()),
          ...simbolosInteres.map(a => String(a.activo ?? a).trim().toUpperCase())
     ]);

     const accionesTD = await getAccionesTD(activos,simbolosInteres);
     const accionesIOLTodas = await getAccionesIOL();

     const filtrados = accionesIOLTodas.filter(item =>
          simbolosSet.has(String(item.simbolo).trim().toUpperCase())
     );

     const candidatasRandom = accionesIOLTodas.filter(item =>
          !simbolosSet.has(String(item.simbolo).trim().toUpperCase())
     );

     const randomExtra = sampleRandom(candidatasRandom, 8);

     const accionesIOL = [...filtrados, ...randomExtra];
     // const accionesIOL: [] = [];
     // const accionesTD: [] = [];

     const marketSnapshot = [...accionesTD, ...accionesIOL];
     console.log("ms", marketSnapshot); console.log("llego a marketservice")
     return await runDecisionEngine(marketSnapshot, totalMoney);
};