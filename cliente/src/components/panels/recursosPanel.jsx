function RecursosPanel({ tab, nuevoRecurso, setNuevoRecurso, crearRecurso, recursos, consumirRecurso, reponerRecurso }) {
  return (
    <>
      {tab === "recursos" && (
              <section className="card">
                <h2>Recursos y Repuestos</h2>
      
                <form className="form" onSubmit={crearRecurso}>
                  <input
                    placeholder="Nombre"
                    value={nuevoRecurso.nombre}
                    onChange={(e) => setNuevoRecurso({ ...nuevoRecurso, nombre: e.target.value })}
                  />
                  <select
                    value={nuevoRecurso.tipo}
                    onChange={(e) => setNuevoRecurso({ ...nuevoRecurso, tipo: e.target.value })}
                  >
                    <option value="repuesto">repuesto</option>
                    <option value="insumo">insumo</option>
                    <option value="herramienta">herramienta</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Stock"
                    value={nuevoRecurso.stock}
                    onChange={(e) => setNuevoRecurso({ ...nuevoRecurso, stock: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Minimo"
                    value={nuevoRecurso.minimo}
                    onChange={(e) => setNuevoRecurso({ ...nuevoRecurso, minimo: e.target.value })}
                  />
                  <button type="submit">Agregar</button>
                </form>
      
                <ul className="lista-recursos">
                  {recursos.map((r) => (
                    <li key={r.id} className="item-recurso">
                      <div className="recurso-texto">
                        {r.nombre} ({r.tipo}) - Stock: {r.stock} / Min: {r.minimo}
                      </div>
                      <div className="acciones-recurso">
                        <button type="button" className="mini-btn boton-consumir" onClick={() => consumirRecurso(r.id)}>
                          Consumir 1
                        </button>
                        <button type="button" className="mini-btn boton-reponer" onClick={() => reponerRecurso(r.id)}>
                          Reponer 1
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
    </>
  );
}

export default RecursosPanel;
