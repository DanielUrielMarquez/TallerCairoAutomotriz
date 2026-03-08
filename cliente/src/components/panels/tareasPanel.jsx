function TareasPanel({ tab, cambiarEstadoTarea, tareas, totalTareas, ESTADOS_TAREA }) {
  return (
    <>
      {tab === "tareas" && (
              <section className="card">
                <h2>Tareas</h2>

                <p className="muted" style={{ marginTop: 6 }}>
                  Las tareas se crean desde el modulo <strong>Ordenes</strong>. En esta vista solo se
                  realiza seguimiento y cambio de estado.
                </p>
      
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Orden</th>
                      <th>Vehiculo</th>
                      <th>Descripcion</th>
                      <th>Prioridad</th>
                      <th>Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tareas.map((t) => (
                      <tr key={t.id}>
                        <td>#{t.id}</td>
                        <td>{t.ordenId ? `#${t.ordenId}` : "-"}</td>
                        <td>{t.vehiculo?.patente || "N/A"}</td>
                        <td>{t.descripcion}</td>
                        <td>{t.prioridad}</td>
                        <td>${Number(t.total || 0).toLocaleString("es-AR")}</td>
                        <td>
                          <select
                            value={t.estado}
                            onChange={(e) => cambiarEstadoTarea(t.id, e.target.value)}
                            className={`estado-select estado-tarea-${t.estado}`}
                          >
                            {ESTADOS_TAREA.map((es) => (
                              <option key={es} value={es}>{es}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
      
                <p className="total-tareas">
                  Total acumulado de tareas: <strong>${totalTareas.toLocaleString("es-AR")}</strong>
                </p>
              </section>
            )}
    </>
  );
}

export default TareasPanel;
