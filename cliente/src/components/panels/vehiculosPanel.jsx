function VehiculosPanel({ tab, busquedaVehiculo, setBusquedaVehiculo, cargarTodo, nuevoVehiculo, setNuevoVehiculo, crearVehiculo, clientes, vehiculos, cambiarEstadoVehiculo }) {
  function formatearFechaSolo(raw) {
    if (!raw) return "-";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw).slice(0, 10);
    return d.toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
  }

  return (
    <>
      {tab === "vehiculos" && (
              <section className="card">
                <h2>Vehiculos</h2>
      
                <div className="toolbar">
                  <input
                    placeholder="Buscar por patente, marca, modelo o cliente"
                    value={busquedaVehiculo}
                    onChange={(e) => setBusquedaVehiculo(e.target.value)}
                  />
                  <button type="button" onClick={cargarTodo}>Buscar</button>
                </div>
      
                <form className="form" onSubmit={crearVehiculo}>
                  <select
                    value={nuevoVehiculo.clienteId}
                    onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, clienteId: e.target.value })}
                  >
                    <option value="">Cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
      
                  <input
                    placeholder="Marca"
                    value={nuevoVehiculo.marca}
                    onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, marca: e.target.value })}
                  />
                  <input
                    placeholder="Modelo"
                    value={nuevoVehiculo.modelo}
                    onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, modelo: e.target.value })}
                  />
                  <input
                    placeholder="Patente"
                    value={nuevoVehiculo.patente}
                    onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, patente: e.target.value })}
                  />
      
                  <button type="submit">Agregar</button>
                </form>
      
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Patente</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Cliente</th>
                      <th>Entrada</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehiculos.map((v) => (
                      <tr key={v.id}>
                        <td>#{v.id}</td>
                        <td>{v.patente}</td>
                        <td>{v.marca}</td>
                        <td>{v.modelo}</td>
                        <td>{v.cliente?.nombre || "N/A"}</td>
                        <td>{formatearFechaSolo(v.fechaEntrada)}</td>
                        <td>
                          <select
                            value={v.estado}
                            onChange={(e) => cambiarEstadoVehiculo(v.id, e.target.value)}
                            className={`estado-select estado-${v.estado}`}
                          >
                            <option value="en_taller">en_taller</option>
                            <option value="reingresado">reingresado</option>
                            <option value="entregado">entregado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
    </>
  );
}

export default VehiculosPanel;
