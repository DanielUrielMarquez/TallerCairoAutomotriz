function TareasPanel({ tab, nuevaTarea, setNuevaTarea, otraDescripcionTarea, setOtraDescripcionTarea, crearTarea, vehiculos, trabajadores, cambiarEstadoTarea, tareas, totalTareas, ESTADOS_TAREA, OPCIONES_TAREA }) {
  return (
    <>
      {tab === "tareas" && (
              <section className="card">
                <h2>Tareas</h2>
      
                <form className="form" onSubmit={crearTarea}>
                  <select
                    value={nuevaTarea.vehiculoId}
                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, vehiculoId: e.target.value })}
                  >
                    <option value="">Vehiculo</option>
                    {vehiculos.map((v) => (
                      <option key={v.id} value={v.id}>{v.patente}</option>
                    ))}
                  </select>
      
                  <select
                    value={nuevaTarea.trabajadorId}
                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, trabajadorId: e.target.value })}
                  >
                    <option value="">Trabajador</option>
                    {trabajadores.map((w) => (
                      <option key={w.id} value={w.id}>{w.nombre}</option>
                    ))}
                  </select>
      
                  <select
                    value={nuevaTarea.descripcion}
                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
                  >
                    <option value="">Descripcion</option>
                    {OPCIONES_TAREA.map((op) => (
                      <option key={op} value={op}>
                        {op === "__otra__" ? "Otra (escribir manual)" : op}
                      </option>
                    ))}
                  </select>
      
                  {nuevaTarea.descripcion === "__otra__" && (
                    <input
                      placeholder="Escribi la tarea"
                      value={otraDescripcionTarea}
                      onChange={(e) => setOtraDescripcionTarea(e.target.value)}
                    />
                  )}
      
                  <select
                    value={nuevaTarea.prioridad}
                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, prioridad: e.target.value })}
                  >
                    <option value="baja">baja</option>
                    <option value="media">media</option>
                    <option value="alta">alta</option>
                  </select>
      
                  <div className="date-field">
                    <label htmlFor="tarea-fecha-limite">Fecha limite de la tarea</label>
                    <input
                      id="tarea-fecha-limite"
                      type="date"
                      value={nuevaTarea.fechaLimite}
                      onChange={(e) => setNuevaTarea({ ...nuevaTarea, fechaLimite: e.target.value })}
                    />
                  </div>
      
                  <input
                    type="number"
                    min="0"
                    placeholder="Costo total"
                    value={nuevaTarea.total}
                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, total: e.target.value })}
                  />
      
                  <button type="submit">Crear</button>
                </form>
      
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
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
