export function buildResumenAsistencia(asistencias) {
  const presentes = asistencias.filter((a) => a.estado === "presente").length;
  const ausentes = asistencias.filter((a) => a.estado === "ausente").length;
  const tarde = asistencias.filter((a) => a.estado === "tarde").length;
  const total = asistencias.length;
  const porcentaje = total ? Math.round((presentes / total) * 100) : 0;
  return { presentes, ausentes, tarde, total, porcentaje };
}

export function calculateTotalTareas(tareas) {
  return tareas.reduce((acc, t) => acc + Number(t.total || 0), 0);
}

export function buildTrabajadorPorUsuario(trabajadores) {
  const map = {};
  trabajadores.forEach((t) => {
    if (t.usuarioId) map[t.usuarioId] = t;
  });
  return map;
}
