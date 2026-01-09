export function alertaInversionTemplate({
  recomendacion,
  activo,
  tipo_activo,
  precio,
  monto_sug,
  detalle,
  mercado,
}) {
  return `
    <h2>Alerta de Inversión</h2>
    <p><strong>Recomendación:</strong> ${recomendacion}</p>
    <p><strong>Activo:</strong> ${activo}</p>
    <p><strong>Tipo:</strong> ${tipo_activo}</p>
    <p><strong>Precio:</strong> ${precio}</p>
    <p><strong>Monto sugerido:</strong> ${monto_sug}</p>
    <p><strong>Mercado:</strong> ${mercado}</p>
    <p>${detalle}</p>
  `;
}
