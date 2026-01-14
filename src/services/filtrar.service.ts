export interface MarketAsset {
  simbolo: string;
  ultimoPrecio: number;
  apertura: number;
  maximo: number;
  minimo: number;
  variacionPorcentual: number;
  volumen: number;
  cantidadOperaciones: number;
  precioCompra: number;
  precioVenta: number;
  cantidadCompra: number;
  cantidadVenta: number;
}

export interface EvaluatedAsset extends MarketAsset {
  spreadPct: number;
  momentum: number;
  rango: number;
  buyPressure?: number;
}


const calcularSpreadPct = (buy: number, sell: number): number =>
  buy > 0 ? (sell - buy) / buy : 1;

const calcularMomentum = (ultimo: number, apertura: number): number =>
  apertura > 0 ? (ultimo - apertura) / apertura : 0;

const calcularRango = (max: number, min: number): number =>
  min > 0 ? (max - min) / min : 0;

const calcularBuyPressure = (buyQty: number, sellQty: number): number => {
  const total = buyQty + sellQty;
  return total > 0 ? buyQty / total : 0;
};


export function filtrarActivosApertura(
  assets: MarketAsset[]
): EvaluatedAsset[] {
  return assets
    .map(a => {
      const spreadPct = calcularSpreadPct(a.precioCompra, a.precioVenta);
      const momentum = calcularMomentum(a.ultimoPrecio, a.apertura);
      const rango = calcularRango(a.maximo, a.minimo);

      return { ...a, spreadPct, momentum, rango };
    })
    .filter(a =>
      a.volumen >= 500 &&
      a.cantidadOperaciones >= 20 &&
      a.spreadPct <= 0.008 &&
      a.momentum > 0 &&
      a.variacionPorcentual > 0
    )
    .sort((a, b) => b.momentum - a.momentum);
}


export function filtrarActivosMediodia(
  assets: MarketAsset[]
): EvaluatedAsset[] {
  return assets
    .map(a => {
      const spreadPct = calcularSpreadPct(a.precioCompra, a.precioVenta);
      const momentum = calcularMomentum(a.ultimoPrecio, a.apertura);
      const rango = calcularRango(a.maximo, a.minimo);
      const buyPressure = calcularBuyPressure(
        a.cantidadCompra,
        a.cantidadVenta
      );

      return { ...a, spreadPct, momentum, rango, buyPressure };
    })
    .filter(a =>
      a.volumen >= 700 &&
      a.cantidadOperaciones >= 30 &&
      a.spreadPct <= 0.006 &&
      (a.buyPressure ?? 0) >= 0.6 &&
      a.ultimoPrecio >= a.maximo * 0.985
    )
    .sort((a, b) => (b.buyPressure ?? 0) - (a.buyPressure ?? 0));
}
