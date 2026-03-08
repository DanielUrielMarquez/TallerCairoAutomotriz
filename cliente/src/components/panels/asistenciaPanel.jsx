function AsistenciaPanel({ tab, resumenAsistencia, filtroAsistenciaFecha, setFiltroAsistenciaFecha, cargarTodo, nuevaAsistencia, setNuevaAsistencia, trabajadores, crearAsistencia, asistencias }) {
  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const isoDate = String(fecha).slice(0, 10);
    const [y, m, d] = isoDate.split("-");
    if (!y || !m || !d) return String(fecha);
    return `${d}/${m}/${y}`;
  };

  return (
    <>
      {tab === "asistencia" && (
              <section className="card">
                <h2>Asistencia</h2>
      
                <div className="stats-grid" style={{ marginBottom: 12 }}>
                  <article className="stat"><span>Registros</span><strong>{resumenAsistencia.total}</strong></article>
                  <article className="stat"><span>Presentes</span><strong>{resumenAsistencia.presentes}</strong></article>
                  <article className="stat"><span>Ausentes</span><strong>{resumenAsistencia.ausentes}</strong></article>
                  <article className="stat"><span>Tarde</span><strong>{resumenAsistencia.tarde}</strong></article>
                  <article className="stat"><span>% Asistencia</span><strong>{resumenAsistencia.porcentaje}%</strong></article>
                </div>
      
                <div className="toolbar">
                  <input
                    type="date"
                    value={filtroAsistenciaFecha}
                    onChange={(e) => setFiltroAsistenciaFecha(e.target.value)}
                  />
                  <button type="button" onClick={cargarTodo}>Filtrar</button>
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroAsistenciaFecha("");
                      setTimeout(cargarTodo, 0);
                    }}
                  >
                    Limpiar
                  </button>
                </div>
      
                <form className="form" onSubmit={crearAsistencia}>
                  <select
                    value={nuevaAsistencia.trabajadorId}
                    onChange={(e) => setNuevaAsistencia({ ...nuevaAsistencia, trabajadorId: e.target.value })}
                  >
                    <option value="">Trabajador</option>
                    {trabajadores.map((w) => (
                      <option key={w.id} value={w.id}>{w.nombre}</option>
                    ))}
                  </select>
                  <select
                    value={nuevaAsistencia.estado}
                    onChange={(e) => setNuevaAsistencia({ ...nuevaAsistencia, estado: e.target.value })}
                  >
                    <option value="presente">presente</option>
                    <option value="ausente">ausente</option>
                    <option value="tarde">tarde</option>
                  </select>
                  <button type="submit">Registrar</button>
                </form>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Trabajador</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asistencias.map((a) => (
                        <tr key={a.id}>
                          <td>#{a.id}</td>
                          <td>{formatFecha(a.fecha)}</td>
                          <td>{a.trabajador?.nombre || a.trabajadorId}</td>
                          <td>{a.estado}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
    </>
  );
}

export default AsistenciaPanel;
