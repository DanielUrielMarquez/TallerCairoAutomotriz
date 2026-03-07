function ClientesPanel({ tab, nuevoCliente, setNuevoCliente, crearCliente, clientes }) {
  return (
    <>
      {tab === "clientes" && (
              <section className="card">
                <h2>Clientes</h2>
      
                <form className="form" onSubmit={crearCliente}>
                  <input
                    placeholder="Nombre"
                    value={nuevoCliente.nombre}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                  />
                  <input
                    placeholder="Telefono"
                    value={nuevoCliente.telefono}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                  />
                  <input
                    placeholder="Email"
                    value={nuevoCliente.email}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
                  />
                  <button type="submit">Agregar</button>
                </form>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Telefono</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((c) => (
                      <tr key={c.id}>
                        <td>#{c.id}</td>
                        <td>{c.nombre}</td>
                        <td>{c.telefono}</td>
                        <td>{c.email || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
    </>
  );
}

export default ClientesPanel;
