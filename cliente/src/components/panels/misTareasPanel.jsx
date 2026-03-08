function MisTareasPanel({
  tab,
  usuario,
  tareas,
  trabajadorPorUsuario,
  cambiarEstadoTarea,
  ESTADOS_TAREA
}) {
  if (tab !== "mis_tareas") return null;

  const esAdmin = usuario?.rol === "administrador";

  let tareasFiltradas = tareas;
  let titulo = "Tareas asignadas";

  if (!esAdmin) {
    const trabajador = trabajadorPorUsuario?.[usuario?.id];
    const trabajadorId = trabajador?.id;
    tareasFiltradas = trabajadorId
      ? tareas.filter((t) => Number(t.trabajadorId) === Number(trabajadorId))
      : [];
    titulo = "Mis tareas asignadas";
  }

  function formatearFechaHora(tarea) {
    const raw =
      tarea.fechaHora ||
      tarea.ordenCreatedAt ||
      tarea.createdAt ||
      null;
    if (!raw) return "-";

    const str = String(raw);
    const match = str
      .replace("T", " ")
      .replace("Z", "")
      .match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?/);

    if (match) {
      const [, y, m, d, hh, mm, ss = "00"] = match;
      return `${d}/${m}/${y}, ${hh}:${mm}:${ss}`;
    }

    const d = new Date(str);
    if (Number.isNaN(d.getTime())) return str;

    return d.toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires"
    });
  }

  return (
    <section className="card">
      <h2>{titulo}</h2>

      {!tareasFiltradas.length ? (
        <p>No hay tareas asignadas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Trabajador</th>
              <th>Fecha y hora</th>
              <th>Vehiculo</th>
              <th>Descripcion</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {tareasFiltradas.map((t) => (
              <tr key={t.id}>
                <td>#{t.id}</td>
                <td>{t.trabajador?.nombre || "N/A"}</td>
                <td>{formatearFechaHora(t)}</td>
                <td>{t.vehiculo?.patente || "N/A"}</td>
                <td>{t.descripcion}</td>
                <td>${Number(t.total || 0).toLocaleString("es-AR")}</td>
                <td>
                  <select
                    value={t.estado}
                    onChange={(e) => cambiarEstadoTarea(t.id, e.target.value)}
                    className={`estado-select estado-tarea-${t.estado}`}
                  >
                    {ESTADOS_TAREA.map((es) => (
                      <option key={es} value={es}>
                        {es}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default MisTareasPanel;
