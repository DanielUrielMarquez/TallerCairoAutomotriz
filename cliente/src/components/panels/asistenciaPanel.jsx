function AsistenciaPanel({ tab, resumenAsistencia, filtroAsistenciaFecha, setFiltroAsistenciaFecha, cargarTodo, nuevaAsistencia, setNuevaAsistencia, trabajadores, crearAsistencia, asistencias }) {
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
      
                  <input
                    type="date"
                    value={nuevaAsistencia.fecha}
                    onChange={(e) => setNuevaAsistencia({ ...nuevaAsistencia, fecha: e.target.value })}
                  />
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
      
                <ul className="list">
                  {asistencias.map((a) => (
                    <li key={a.id}>{a.fecha} - {a.trabajador?.nombre || a.trabajadorId} - {a.estado}</li>
                  ))}
                </ul>
              </section>
            )}
    </>
  );
}

export default AsistenciaPanel;
