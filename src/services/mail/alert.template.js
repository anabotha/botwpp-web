export function alertaInversionTemplate({
  recomendacion,
  activo,
  precio,
  detalle,
  mercado,
}) {
  return `
    <h2>Alerta de Inversión</h2>
    <p><strong>Recomendación:</strong> ${recomendacion}</p>
    <p><strong>Activo:</strong> ${activo}</p>
    <p><strong>Precio:</strong> ${precio}</p>
    <p><strong>Mercado:</strong> ${mercado}</p>
    <p>${detalle}</p>
  `;
}
