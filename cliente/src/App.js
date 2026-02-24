import { useEffect, useMemo, useState } from "react";
import { api } from "./services/api";
import "./App.css";

// Estados posibles de las tareas
const ESTADOS_TAREA = ["abierta", "en_proceso", "cerrada"];

function App() {
  const [tab, setTab] = useState(() => localStorage.getItem("tab_actual") || "clientes");
  const [usuario, setUsuario] = useState(() => {
    const raw = localStorage.getItem("usuario_sesion");
    return raw ? JSON.parse(raw) : null;
  });

  // Roles y pestañas visibles según perfil
  const esAdmin = usuario?.rol === "administrador";
  const tabsVisibles = esAdmin
    ? ["clientes", "vehiculos", "tareas", "recursos", "asistencia", "reportes", "usuarios"]
    : ["clientes", "vehiculos", "tareas", "recursos", "asistencia"];

  // Estados globales de UI
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Datos principales traídos del backend
  const [resumen, setResumen] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [asistencias, setAsistencias] = useState([]);

  // Usuarios (solo admin)
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: "",
    password: "",
    rol: "trabajador"
  });

  // Formulario de login
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  // Formularios de cada módulo
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", telefono: "", email: "" });

  const [busquedaVehiculo, setBusquedaVehiculo] = useState("");
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    clienteId: "",
    marca: "",
    modelo: "",
    patente: "",
    fechaEntrada: "",
    fechaLimite: "",
    diagnostico: ""
  });

  const [nuevaTarea, setNuevaTarea] = useState({
    vehiculoId: "",
    trabajadorId: "",
    descripcion: "",
    prioridad: "media",
    fechaLimite: "",
    total: ""
  });

  const [nuevoRecurso, setNuevoRecurso] = useState({
    nombre: "",
    tipo: "repuesto",
    stock: "",
    minimo: ""
  });

  const [nuevaAsistencia, setNuevaAsistencia] = useState({
    trabajadorId: "1",
    fecha: "",
    estado: "presente"
  });

  const [filtroAsistenciaFecha, setFiltroAsistenciaFecha] = useState("");

  // Lista única de trabajadores desde tareas
  const trabajadores = useMemo(() => {
    const map = {};
    tareas.forEach((t) => {
      if (t.trabajador) map[t.trabajador.id] = t.trabajador;
    });
    return Object.values(map);
  }, [tareas]);

  // Resumen asistencia
  const resumenAsistencia = useMemo(() => {
    const presentes = asistencias.filter((a) => a.estado === "presente").length;
    const ausentes = asistencias.filter((a) => a.estado === "ausente").length;
    const tarde = asistencias.filter((a) => a.estado === "tarde").length;
    const total = asistencias.length;
    const porcentaje = total ? Math.round((presentes / total) * 100) : 0;
    return { presentes, ausentes, tarde, total, porcentaje };
  }, [asistencias]);

  // Total acumulado de tareas
  const totalTareas = useMemo(() => {
    return tareas.reduce((acc, t) => acc + Number(t.total || 0), 0);
  }, [tareas]);

  // Carga general
  async function cargarTodo() {
    try {
      setLoading(true);
      setError("");

      const basePromises = [
        api.getResumen(),
        api.getClientes(),
        api.getVehiculos(busquedaVehiculo),
        api.getTareas(),
        api.getRecursos(),
        api.getAsistencias(filtroAsistenciaFecha)
      ];

      const [r, c, v, t, rc, a] = await Promise.all(basePromises);

      setResumen(r);
      setClientes(c);
      setVehiculos(v);
      setTareas(t);
      setRecursos(rc);
      setAsistencias(a);

      if (esAdmin && api.getUsuarios) {
        const us = await api.getUsuarios();
        if (!us.error) setUsuarios(us);
      }
    } catch {
      setError("No se pudo cargar la información.");
    } finally {
      setLoading(false);
    }
  }

  // Cargar cuando hay sesión
  useEffect(() => {
    if (usuario) cargarTodo();
  }, [usuario]);

  // Si cambia de rol o tab inválida, volver a clientes
  useEffect(() => {
    if (!tabsVisibles.includes(tab)) {
      setTab("clientes");
    }
  }, [tab, tabsVisibles]);

  // Persistir pestaña
  useEffect(() => {
    localStorage.setItem("tab_actual", tab);
  }, [tab]);

  // Login
  async function onLogin(e) {
    e.preventDefault();
    setError("");

    const res = await api.login(loginForm);
    if (res.error) return setError(res.error);

    setUsuario(res.usuario);
    localStorage.setItem("usuario_sesion", JSON.stringify(res.usuario));
  }

  // Logout
  function cerrarSesion() {
    setUsuario(null);
    setTab("clientes");
    setError("");
    setLoginForm({ username: "", password: "" });
    localStorage.removeItem("usuario_sesion");
  }

  // Crear cliente
  async function crearCliente(e) {
    e.preventDefault();
    const res = await api.createCliente(nuevoCliente);
    if (res.error) return setError(res.error);
    setNuevoCliente({ nombre: "", telefono: "", email: "" });
    cargarTodo();
  }

  // Crear vehículo
  async function crearVehiculo(e) {
    e.preventDefault();
    const res = await api.createVehiculo({
      ...nuevoVehiculo,
      clienteId: Number(nuevoVehiculo.clienteId)
    });
    if (res.error) return setError(res.error);

    setNuevoVehiculo({
      clienteId: "",
      marca: "",
      modelo: "",
      patente: "",
      fechaEntrada: "",
      fechaLimite: "",
      diagnostico: ""
    });
    cargarTodo();
  }

  // Cambiar estado vehículo
  async function cambiarEstadoVehiculo(id, estado) {
    const res = await api.updateEstadoVehiculo(id, estado);
    if (res.error) return setError(res.error);
    cargarTodo();
  }

  // Crear tarea
  async function crearTarea(e) {
    e.preventDefault();
    const res = await api.createTarea({
      ...nuevaTarea,
      vehiculoId: Number(nuevaTarea.vehiculoId),
      trabajadorId: Number(nuevaTarea.trabajadorId),
      total: Number(nuevaTarea.total || 0)
    });
    if (res.error) return setError(res.error);

    setNuevaTarea({
      vehiculoId: "",
      trabajadorId: "",
      descripcion: "",
      prioridad: "media",
      fechaLimite: "",
      total: ""
    });
    cargarTodo();
  }

  // Cambiar estado tarea
  async function cambiarEstadoTarea(id, estado) {
    const res = await api.updateEstadoTarea(id, estado);
    if (res.error) return setError(res.error);
    cargarTodo();
  }

  // Crear recurso/repuesto
  async function crearRecurso(e) {
    e.preventDefault();
    const res = await api.createRecurso(nuevoRecurso);
    if (res.error) return setError(res.error);
    setNuevoRecurso({ nombre: "", tipo: "repuesto", stock: "", minimo: "" });
    cargarTodo();
  }

  // Consumir recurso
  async function consumirRecurso(id) {
    const res = await api.consumirRecurso(id, 1);
    if (res.error) return setError(res.error);
    cargarTodo();
  }

  // Reponer recurso
  async function reponerRecurso(id) {
    const res = await api.reponerRecurso(id, 1);
    if (res.error) return setError(res.error);
    cargarTodo();
  }

  // Crear asistencia
  async function crearAsistencia(e) {
    e.preventDefault();
    const res = await api.createAsistencia({
      ...nuevaAsistencia,
      trabajadorId: Number(nuevaAsistencia.trabajadorId)
    });
    if (res.error) return setError(res.error);
    setNuevaAsistencia({ trabajadorId: "1", fecha: "", estado: "presente" });
    cargarTodo();
  }

  // Crear usuario (solo admin)
  async function crearUsuario(e) {
    e.preventDefault();
    if (!api.createUsuario) return;

    const res = await api.createUsuario({
      ...nuevoUsuario,
      adminUser: usuario
    });

    if (res.error) return setError(res.error);

    setNuevoUsuario({ username: "", password: "", rol: "trabajador" });
    cargarTodo();
  }

  // Vista login
  if (!usuario) {
    return (
      <main className="layout">
        <section className="card auth-card">
          <h1>Taller Cairo</h1>
          <p>Ingresar al sistema</p>

          <form className="form one-col" onSubmit={onLogin}>
            <input
              placeholder="Usuario"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            />
            <input
              placeholder="Contraseña"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <button type="submit">Entrar</button>
          </form>

          {error && <p className="error">{error}</p>}
          <small>Demo: admin / 1234</small>
        </section>
      </main>
    );
  }

  return (
    <main className="layout">
      <header className="topbar">
        <div>
          <h1>Sistema Taller Automotriz</h1>
          <p>{usuario.username} ({usuario.rol})</p>
        </div>

        <div className="topbar-actions">
          <button type="button" className="btn-logout" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {resumen && (
        <section className="stats-grid always-visible-stats">
          <button type="button" className="stat clickable" onClick={() => setTab("clientes")}>
            <span>Clientes</span><strong>{resumen.clientes}</strong>
          </button>
          <button type="button" className="stat clickable" onClick={() => setTab("vehiculos")}>
            <span>Vehículos en taller</span><strong>{resumen.vehiculosEnTaller}</strong>
          </button>
          <button type="button" className="stat clickable" onClick={() => setTab("tareas")}>
            <span>Tareas abiertas</span><strong>{resumen.tareasAbiertas}</strong>
          </button>
          <button type="button" className="stat clickable" onClick={() => setTab("tareas")}>
            <span>En proceso</span><strong>{resumen.tareasEnProceso}</strong>
          </button>
          <button type="button" className="stat clickable" onClick={() => setTab("tareas")}>
            <span>Cerradas</span><strong>{resumen.tareasCerradas}</strong>
          </button>
          <button type="button" className="stat clickable" onClick={() => setTab("recursos")}>
            <span>Stock bajo</span><strong>{resumen.recursosStockBajo}</strong>
          </button>
        </section>
      )}

      {resumen && (
        <div className="top-kpi-bar">
          <span className="kpi-label">Alertas</span>
          <span className={`kpi-stock ${resumen.recursosStockBajo > 0 ? "danger" : "ok"}`}>
            Stock bajo: {resumen.recursosStockBajo}
          </span>
        </div>
      )}

      <nav className="tabs tabs-wide">
        {tabsVisibles.map((t) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>

      {error && <p className="error">{error}</p>}
      {loading && <p>Cargando...</p>}

      {tab === "clientes" && (
        <section className="card">
          <h2>Clientes</h2>
          <form className="form" onSubmit={crearCliente}>
            <input placeholder="Nombre" value={nuevoCliente.nombre} onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })} />
            <input placeholder="Teléfono" value={nuevoCliente.telefono} onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })} />
            <input placeholder="Email" value={nuevoCliente.email} onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })} />
            <button type="submit">Agregar</button>
          </form>
          <ul className="list">
            {clientes.map((c) => (
              <li key={c.id}>{c.nombre} - {c.telefono} - {c.email}</li>
            ))}
          </ul>
        </section>
      )}

      {tab === "vehiculos" && (
        <section className="card">
          <h2>Vehículos</h2>

          <div className="toolbar">
            <input
              placeholder="Buscar por patente, marca, modelo o cliente"
              value={busquedaVehiculo}
              onChange={(e) => setBusquedaVehiculo(e.target.value)}
            />
            <button onClick={cargarTodo}>Buscar</button>
          </div>

          <form className="form" onSubmit={crearVehiculo}>
            <select value={nuevoVehiculo.clienteId} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, clienteId: e.target.value })}>
              <option value="">Cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>

            <input placeholder="Marca" value={nuevoVehiculo.marca} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, marca: e.target.value })} />
            <input placeholder="Modelo" value={nuevoVehiculo.modelo} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, modelo: e.target.value })} />
            <input placeholder="Patente" value={nuevoVehiculo.patente} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, patente: e.target.value })} />

            <div className="date-field">
              <label htmlFor="vehiculo-fecha-entrada">Fecha de entrada</label>
              <input
                id="vehiculo-fecha-entrada"
                type="date"
                value={nuevoVehiculo.fechaEntrada}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, fechaEntrada: e.target.value })}
              />
            </div>

            <div className="date-field">
              <label htmlFor="vehiculo-fecha-limite">Fecha límite</label>
              <input
                id="vehiculo-fecha-limite"
                type="date"
                value={nuevoVehiculo.fechaLimite}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, fechaLimite: e.target.value })}
              />
            </div>

            <input placeholder="Diagnóstico" value={nuevoVehiculo.diagnostico} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, diagnostico: e.target.value })} />
            <button type="submit">Agregar</button>
          </form>

          <ul className="list">
            {vehiculos.map((v) => (
              <li key={v.id}>
                {v.patente} - {v.marca} {v.modelo} | {v.cliente?.nombre} |
                <select
                  value={v.estado}
                  onChange={(e) => cambiarEstadoVehiculo(v.id, e.target.value)}
                  className={`estado-select estado-${v.estado}`}
                  style={{ marginLeft: 8 }}
                >
                  <option value="en_taller">en_taller</option>
                  <option value="reingresado">reingresado</option>
                  <option value="entregado">entregado</option>
                </select>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "tareas" && (
        <section className="card">
          <h2>Tareas</h2>

          <form className="form" onSubmit={crearTarea}>
            <select value={nuevaTarea.vehiculoId} onChange={(e) => setNuevaTarea({ ...nuevaTarea, vehiculoId: e.target.value })}>
              <option value="">Vehículo</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>{v.patente}</option>
              ))}
            </select>

            <select value={nuevaTarea.trabajadorId} onChange={(e) => setNuevaTarea({ ...nuevaTarea, trabajadorId: e.target.value })}>
              <option value="">Trabajador</option>
              {(trabajadores.length ? trabajadores : [{ id: 1, nombre: "Carlos Mena" }, { id: 2, nombre: "Luis Rios" }]).map((w) => (
                <option key={w.id} value={w.id}>{w.nombre}</option>
              ))}
            </select>

            <input placeholder="Descripción" value={nuevaTarea.descripcion} onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })} />

            <select value={nuevaTarea.prioridad} onChange={(e) => setNuevaTarea({ ...nuevaTarea, prioridad: e.target.value })}>
              <option value="baja">baja</option>
              <option value="media">media</option>
              <option value="alta">alta</option>
            </select>

            <div className="date-field">
              <label htmlFor="tarea-fecha-limite">Fecha límite de la tarea</label>
              <input
                id="tarea-fecha-limite"
                type="date"
                value={nuevaTarea.fechaLimite}
                onChange={(e) => setNuevaTarea({ ...nuevaTarea, fechaLimite: e.target.value })}
              />
            </div>

            <input type="number" min="0" placeholder="Costo total" value={nuevaTarea.total} onChange={(e) => setNuevaTarea({ ...nuevaTarea, total: e.target.value })} />
            <button type="submit">Crear</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>ID</th><th>Vehículo</th><th>Descripción</th><th>Prioridad</th><th>Total</th><th>Estado</th>
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

      {tab === "recursos" && (
        <section className="card">
          <h2>Recursos y Repuestos</h2>

          <form className="form" onSubmit={crearRecurso}>
            <input placeholder="Nombre" value={nuevoRecurso.nombre} onChange={(e) => setNuevoRecurso({ ...nuevoRecurso, nombre: e.target.value })} />
            <select value={nuevoRecurso.tipo} onChange={(e) => setNuevoRecurso({ ...nuevoRecurso, tipo: e.target.value })}>
              <option value="repuesto">repuesto</option>
              <option value="insumo">insumo</option>
              <option value="herramienta">herramienta</option>
            </select>
            <input type="number" placeholder="Stock" value={nuevoRecurso.stock} onChange={(e) => setNuevoRecurso({ ...nuevoRecurso, stock: e.target.value })} />
            <input type="number" placeholder="Mínimo" value={nuevoRecurso.minimo} onChange={(e) => setNuevoRecurso({ ...nuevoRecurso, minimo: e.target.value })} />
            <button type="submit">Agregar</button>
          </form>

          <ul className="lista-recursos">
            {recursos.map((r) => (
              <li key={r.id} className="item-recurso">
                <div className="recurso-texto">
                  {r.nombre} ({r.tipo}) - Stock: {r.stock} / Mín: {r.minimo}
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
            <input type="date" value={filtroAsistenciaFecha} onChange={(e) => setFiltroAsistenciaFecha(e.target.value)} />
            <button onClick={cargarTodo}>Filtrar</button>
            <button
              onClick={() => {
                setFiltroAsistenciaFecha("");
                setTimeout(cargarTodo, 0);
              }}
            >
              Limpiar
            </button>
          </div>

          <form className="form" onSubmit={crearAsistencia}>
            <select value={nuevaAsistencia.trabajadorId} onChange={(e) => setNuevaAsistencia({ ...nuevaAsistencia, trabajadorId: e.target.value })}>
              <option value="1">Carlos Mena</option>
              <option value="2">Luis Rios</option>
            </select>
            <input type="date" value={nuevaAsistencia.fecha} onChange={(e) => setNuevaAsistencia({ ...nuevaAsistencia, fecha: e.target.value })} />
            <select value={nuevaAsistencia.estado} onChange={(e) => setNuevaAsistencia({ ...nuevaAsistencia, estado: e.target.value })}>
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

      {tab === "reportes" && (
        <section className="card">
          <h2>Reportes</h2>
          <ul className="list">
            <li>Clientes registrados: {resumen?.clientes ?? 0}</li>
            <li>Vehículos en taller: {resumen?.vehiculosEnTaller ?? 0}</li>
            <li>Tareas abiertas: {resumen?.tareasAbiertas ?? 0}</li>
            <li>Tareas en proceso: {resumen?.tareasEnProceso ?? 0}</li>
            <li>Tareas cerradas: {resumen?.tareasCerradas ?? 0}</li>
            <li>Recursos con stock bajo: {resumen?.recursosStockBajo ?? 0}</li>
            <li>Total acumulado de tareas: ${totalTareas.toLocaleString("es-AR")}</li>
          </ul>
        </section>
      )}

      {tab === "usuarios" && esAdmin && (
        <section className="card">
          <h2>Usuarios</h2>

          <form className="form" onSubmit={crearUsuario}>
            <input
              placeholder="Usuario"
              value={nuevoUsuario.username}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, username: e.target.value })}
            />
            <input
              placeholder="Contraseña"
              type="password"
              value={nuevoUsuario.password}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
            />
            <select
              value={nuevoUsuario.rol}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
            >
              <option value="trabajador">trabajador</option>
              <option value="administrador">administrador</option>
            </select>
            <button type="submit">Crear usuario</button>
          </form>

          <ul className="list">
            {usuarios.map((u) => (
              <li key={u.id}>
                {u.username} - {u.rol}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

export default App;
