import { getSimbolosDb, getSimbolosInteresDb,getRecentRecommendationsDb } from "./db.service.js";
import { getPriceCommonStock, getPriceEtf } from "./marketData.service.js";
import { getTotalArs, getTotalUsd } from "./wallet.service.js";
import { getCedearsTodos, getLetrasTodas } from "./marketIOL.service.js";
import { runDecisionEngine } from "../ia/evaluator/decisionEngine.js";
import { filtrarActivosApertura,filtrarActivosMediodia } from "./filtrar.service.js";
export interface simbolosActivos{
     activo: string;
     exchange: string;
     tipo_activo: string;
     poseido: boolean;
     costo_promedio: number;
     cantidad_total: number;
}
export const getAccionesIOL = async () => {
     // console.log("getAccionesIol")
     // IOL suele devolver un objeto que contiene una lista llamada 'titulos'
     const dataCedears = await getCedearsTodos();
     const dataLetras = await getLetrasTodas();

     // Extraemos los arrays de títulos y los marcamos
     const cedears = (dataCedears.titulos || []).map((t: any) => ({ ...t, origen: "IOL_CEDEAR" }));
     const letras = (dataLetras.titulos || []).map((t: any) => ({ ...t, origen: "IOL_LETRA" }));

     return [...cedears, ...letras];
};

export const getAccionesTD = async (activos: simbolosActivos[],simbolosInteres: any[]) => {
     const exchanges = ["NASDAQ", "NYSE"];


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
               // console.log(`Evaluando ${item.ticker} (${item.poseido ? 'En Portafolio' : 'Interés'})...`);

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


export function sampleRandom<T>(array: T[], n: number): T[] {
     return array
          .sort(() => Math.random() - 0.5)
          .slice(0, n);
}



export const validarHorarioMercado = (): boolean => {
const now = new Date();
const h = now.getUTCHours();
const m = now.getUTCMinutes();
console.log(`Hora UTC actual: ${h}:${m}`);
const dentroVentana =
  (h > 13 || (h === 13 && m >= 40)) &&
  (h < 19 || (h === 19 && m <= 30));

return dentroVentana;
}


export const ejecutarEvaluacionMercado = async () => {
     // console.log("ejectura evaluaciokn mercado");
     let activos: any[] = await getSimbolosDb() ?? [];
     const simbolosInteres : any[] = await getSimbolosInteresDb() ?? [];

     let recentRecommendations = await getRecentRecommendationsDb(2);
     
     const esDiaLaboral = () => {
          const day = new Date().getDay();
          return day !== 0 && day !== 6;
     };
     
     if (!esDiaLaboral()) return { message: "Mercado cerrado (fin de semana)" };
     if (!validarHorarioMercado()) return { message: "Mercado cerrado (fuera de horario 9:30-16:00 EST)" };

     const [getArs, getUsd] = await Promise.all([getTotalArs(), getTotalUsd()]);
     const totalMoney = {
          ars: getArs ?? 0,
          usd: getUsd ?? 0
     };
     // console.log(totalMoney)

     const simbolosSet = new Set([
          ...activos.map(a => String(a.activo ?? a).trim().toUpperCase()),
          ...simbolosInteres.map(a => String(a.activo ?? a).trim().toUpperCase())
     ]);

     const accionesTD = await getAccionesTD(activos,simbolosInteres);
     const accionesIOLTodas = await getAccionesIOL();

     const filtrados = accionesIOLTodas.filter(item =>
          simbolosSet.has(String(item.simbolo).trim().toUpperCase())
     );

     // Filtrar solo candidatas nuevas (que no están en cartera)
     const candidatasNuevas = accionesIOLTodas.filter(item =>
          !simbolosSet.has(String(item.simbolo).trim().toUpperCase())
     );

     // Filtrar candidatas según la hora - aplicar criterios de mercado
     const now = new Date();
     const h = now.getUTCHours();
     const m = now.getUTCMinutes();
const esApertura =
  (h === 13 && m >= 40) ||
  (h === 14 && m < 30);

// 14:30 – 18:00 UTC → Mediodía
const esMediodia =
  (h === 14 && m >= 30) ||
  (h >= 15 && h < 18);

// 18:00 en adelante → Cierre / no operar
const esCierre = h >= 18;
     let filtrosCriterio: any[] = [];
     if (esApertura) {
          filtrosCriterio =  filtrarActivosApertura(candidatasNuevas);
     } else if(esMediodia) {
          filtrosCriterio =  filtrarActivosMediodia(candidatasNuevas);
     }else{
          filtrosCriterio = [];
     }

     const accionesIOL = [...filtrados, ...filtrosCriterio];
     // const accionesIOL: [] = [];
     // const accionesTD: [] = [];
     
     const marketSnapshot = [...accionesTD, ...accionesIOL];
     if (marketSnapshot.length <2) {
          console.log("No hay datos suficientes para evaluar");
  return [];
     }
     console.log("ms", marketSnapshot); console.log("llego a marketservice")
     return await runDecisionEngine(marketSnapshot, totalMoney, recentRecommendations);
};