function MisTareasPanel({ tab, usuario, tareas, trabajadorPorUsuario }) {
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
              <th>Vehiculo</th>
              <th>Descripcion</th>
              <th>Prioridad</th>
              <th>Fecha limite</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {tareasFiltradas.map((t) => (
              <tr key={t.id}>
                <td>#{t.id}</td>
                <td>{t.trabajador?.nombre || "N/A"}</td>
                <td>{t.vehiculo?.patente || "N/A"}</td>
                <td>{t.descripcion}</td>
                <td>{t.prioridad}</td>
                <td>{t.fechaLimite}</td>
                <td>{t.estado}</td>
                <td>${Number(t.total || 0).toLocaleString("es-AR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default MisTareasPanel;
