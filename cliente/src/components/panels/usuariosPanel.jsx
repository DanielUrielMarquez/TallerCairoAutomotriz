function UsuariosPanel({ tab, esAdmin, nuevoTrabajador, setNuevoTrabajador, crearTrabajador, usuarios, trabajadorPorUsuario, eliminarTrabajador }) {
  return (
    <>
      {tab === "usuarios" && esAdmin && (
              <section className="card">
                <h2>Usuarios / Trabajadores</h2>
      
                <form className="form" onSubmit={crearTrabajador}>
                  <input
                    placeholder="Usuario"
                    value={nuevoTrabajador.username}
                    onChange={(e) => setNuevoTrabajador({ ...nuevoTrabajador, username: e.target.value })}
                  />
                  <input
                    placeholder="Contraseña"
                    type="password"
                    value={nuevoTrabajador.password}
                    onChange={(e) => setNuevoTrabajador({ ...nuevoTrabajador, password: e.target.value })}
                  />
                  <input
                    placeholder="Nombre completo"
                    value={nuevoTrabajador.nombre}
                    onChange={(e) => setNuevoTrabajador({ ...nuevoTrabajador, nombre: e.target.value })}
                  />
                  <select
                    value={nuevoTrabajador.especialidad}
                    onChange={(e) => setNuevoTrabajador({ ...nuevoTrabajador, especialidad: e.target.value })}
                  >
                    <option value="General">General</option>
                    <option value="Motor">Motor</option>
                    <option value="Electricidad">Electricidad</option>
                    <option value="Frenos y suspension">Frenos y suspension</option>
                    <option value="Inyeccion">Inyeccion</option>
                    <option value="Caja y transmision">Caja y transmision</option>
                    <option value="Aire acondicionado">Aire acondicionado</option>
                    <option value="Diagnostico">Diagnostico</option>
                  </select>
                  <button type="submit">Crear trabajador</button>
                </form>
      
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Nombre</th>
                      <th>Especialidad</th>
                      <th>Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => {
                      const t = trabajadorPorUsuario[u.id];
                      return (
                        <tr key={u.id}>
                          <td>#{u.id}</td>
                          <td>{u.username}</td>
                          <td>{u.rol}</td>
                          <td>{t?.nombre || "-"}</td>
                          <td>{t?.especialidad || "-"}</td>
                          <td>
                            {u.rol === "trabajador" ? (
                              <button type="button" onClick={() => eliminarTrabajador(u.id)}>
                                Eliminar
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            )}
    </>
  );
}

export default UsuariosPanel;
