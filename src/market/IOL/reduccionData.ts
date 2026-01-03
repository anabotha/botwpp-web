// Tipos mínimos que esperamos desde IOL
export interface IOLTitulo {
     simbolo: string;
     variacionPorcentual: number;
     volumen: number;
     puntas?: {
          precioCompra: number;
          precioVenta: number;
     } | null;
     fechaVencimiento?: string | null;
}
export interface InstrumentoReducido {
     simbolo: string;
     tendencia: string;
     volumen: string;
     liquidez: string;
     vencimiento: string;

}

export function tendenciaSignal(v: number): "sube_fuerte" | "sube" | "estable" | "cae" | "cae_fuerte" {
     if (v >= 1) return "sube_fuerte";
     if (v >= 0.2) return "sube";
     if (v <= -1) return "cae_fuerte";
     if (v <= -0.2) return "cae";
     return "estable";
}

export function liquidezSignal(
     compra?: number,
     venta?: number
): "excelente" | "buena" | "media" | "mala" {
     if (!compra || !venta) return "mala";

     const spread = (venta - compra) / compra;

     if (spread < 0.001) return "excelente";
     if (spread < 0.005) return "buena";
     if (spread < 0.02) return "media";
     return "mala";
}

export function vencimientoSignal(
     fechaVencimiento?: string | null
): "muy_cercano" | "cercano" | "lejano" | "sin_vencimiento" {
     if (!fechaVencimiento) return "sin_vencimiento";

     const dias =
          (new Date(fechaVencimiento).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24);

     if (dias < 30) return "muy_cercano";
     if (dias < 90) return "cercano";
     return "lejano";
}
export function volumenSignal(actual: number, promedio: number): "muy_alto" | "alto" | "normal" | "bajo" {
     if (actual >= promedio * 2) return "muy_alto";
     if (actual >= promedio * 1.3) return "alto";
     if (actual <= promedio * 0.5) return "bajo";
     return "normal";
}

export function reducirInstrumento(
     titulo: IOLTitulo,
     volumenPromedio: number
): InstrumentoReducido {
     return {
          simbolo: titulo.simbolo,
          tendencia: tendenciaSignal(titulo.variacionPorcentual),
          volumen: volumenSignal(titulo.volumen, volumenPromedio),
          liquidez: liquidezSignal(
               titulo.puntas?.precioCompra,
               titulo.puntas?.precioVenta
          ),
          vencimiento: vencimientoSignal(titulo.fechaVencimiento)
     };
}

