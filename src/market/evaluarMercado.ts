import { reducirInstrumento } from "./IOL/reduccionData.js";
import { getCedearsTodos, getLetrasTodas } from "./IOL/cedears/route.ts";
import { IOLTitulo, InstrumentoReducido } from "./IOL/reduccionData.js";
import { supabase } from "../api/db/supabaseClient";
import { getTotalArs } from "../api/db/totalArs";
import { getTotalUsd } from "../api/db/totalUsd";
import { runDecisionEngine } from "@/ia/evaluator/decisionEngine.ts";
// 1. Validar horario de mercado
// 2. Leer dinero disponible desde DB
// 3. Evaluar señales
// 4. Guardar resultado
// 5. Enviar WhatsApp si corresponde
export interface accion {
  exchange?: string;
  precio?: number;
  desc?: string;
  CommonStock?: boolean;
  etf?: boolean;
  compra?: number;
  venta?: number;
  volumen?: number;
  fechaVencimiento?: string;
}
const getSimbolos = async () => {
  const { data, error } = await supabase.rpc("get_simbolos");
  if (error) throw new Error(error.message);
  return data;
}

const getPriceCommonStock = async (accion: string, exchange: string) => {
  const data: accion = await getPriceCommonStock(accion, exchange);
  return data;
}
const getPriceEtf = async (accion: string, exchange: string) => {
  const data: accion = await getPriceEtf(accion, exchange);
  return data;
}
const getAccionesTD = async () => {
  const exchange = ["NASDAQ", "NYSE"];
  let acciones: InstrumentoReducido[] = [];
  const simbolos = await getSimbolos();
  exchange.forEach(async (exch) => {
    simbolos.forEach(async (simbolo) => {
      const precio = await getPriceCommonStock(simbolo.activo, exch);
      const etf = await getPriceEtf(simbolo.activo, exch);
      if (precio) {
        acciones.push({
          simbolo,
          precio: precio.price,
          exchange: exch,
          desc: "twelveData",
          CommonStock: true,
          compra: precio.buy,
          venta: precio.sell,
          volumen: precio.volume
        });
      }
      if (etf) {
        acciones.push({
          simbolo,
          precio: etf.price,
          exchange: exch,
          desc: "twelveData",
          etf: true,
          compra: etf.buy,
          venta: etf.sell,
          volumen?: etf.volume
        });
      }
    });
  });
  return acciones;
}
const getTotales = async () => {//dinero disponible de db
  const getArs = await getTotalArs();
  const getUsd = await getTotalUsd();
  const totalArs = getArs.data[0].total_ars;
  const totalUsd = getUsd.data[0].total_usd;
  return { ars: totalArs, usd: totalUsd }
}

const getAccionesIOL = async () => {//iol
  // const acciones = [];
  // const simbolos = []//aca irian los simbolos q andan en iol
  const cedears = await getCedearsTodos();
  const letras = await getLetrasTodas();
  return { cedears, letras, desc: "iol" };
}
export function pasaFiltroLLM(instr: InstrumentoReducido): boolean {
  if (instr.volumen === "bajo") return false;
  if (instr.liquidez === "mala") return false;
  if (instr.vencimiento === "muy_cercano") return false;
  if (instr.tendencia === "estable") return false;
  return true;
}
export function prepararContextoLLM(
  titulos: IOLTitulo[],
  volumenPromedios: Record<string, number>,
  capitalDisponible: number,
  perfilRiesgo: "bajo" | "medio" | "alto"
) {
  const instrumentos = titulos
    .map(t =>
      reducirInstrumento(
        t,
        volumenPromedios[t.simbolo] ?? t.volumen
      )
    )
    .filter(pasaFiltroLLM)
    .slice(0, 3); // nunca más de 3

  return {
    fecha: new Date().toISOString().slice(0, 16),
    capitalDisponible,
    perfilRiesgo,
    instrumentos
  };
}

export async function evaluarMercado() {
  const totalMoney: { ars: number, usd: number } = await getTotales() ?? {};
  const accionesTD = await getAccionesTD() ?? [];
  const accionesIOL = await getAccionesIOL() ?? [];
  const marketSnapshot = accionesTD.concat(accionesIOL);
  const ia = await runDecisionEngine(marketSnapshot, totalMoney); //aca iria la funcion de la ia q evalua
}
