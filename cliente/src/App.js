import { useEffect, useMemo, useState } from "react";
import { api } from "./services/api";
import "./App.css";

const ESTADOS_TAREA = ["abierta", "en_proceso", "cerrada"];
const TABS = ["dashboard", "clientes", "vehiculos", "tareas", "recursos", "asistencia"];

function App() {
  const [tab, setTab] = useState("dashboard");
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [resumen, setResumen] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [asistencias, setAsistencias] = useState([]);

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

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

  const trabajadores = useMemo(() => {
    const map = {};
    tareas.forEach((t) => {
      if (t.trabajador) map[t.trabajador.id] = t.trabajador;
    });
    return Object.values(map);
  }, [tareas]);

  async function cargarTodo() {
    try {
      setLoading(true);
      setError("");
      const [r, c, v, t, rc, a] = await Promise.all([
        api.getResumen(),
        api.getClientes(),
        api.getVehiculos(busquedaVehiculo),
        api.getTareas(),
        api.getRecursos(),
        api.getAsistencias()
      ]);
      setResumen(r);
      setClientes(c);
      setVehiculos(v);
      setTareas(t);
      setRecursos(rc);
      setAsistencias(a);
    } catch {
      setError("No se pudo cargar la información.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (usuario) cargarTodo();
  }, [usuario]);

  async function onLogin(e) {
    e.preventDefault();
    setError("");
    const res = await api.login(loginForm);
    if (res.error) {
      setError(res.error);
      return;
    }
    setUsuario(res.usuario);
  }

  async function crearCliente(e) {
    e.preventDefault();
    const res = await api.createCliente(nuevoCliente);
    if (res.error) return setError(res.error);
    setNuevoCliente({ nombre: "", telefono: "", email: "" });
    cargarTodo();
  }

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

  async function marcarSalida(id) {
    const hoy = new Date().toISOString().slice(0, 10);
    await api.registrarSalidaVehiculo(id, hoy);
    cargarTodo();
  }

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

  async function cambiarEstadoTarea(id, estado) {
    await api.updateEstadoTarea(id, estado);
    cargarTodo();
  }

  async function crearRecurso(e) {
    e.preventDefault();
    const res = await api.createRecurso(nuevoRecurso);
    if (res.error) return setError(res.error);
    setNuevoRecurso({ nombre: "", tipo: "repuesto", stock: "", minimo: "" });
    cargarTodo();
  }

  async function consumirRecurso(id) {
    await api.consumirRecurso(id, 1);
    cargarTodo();
  }

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
        <button onClick={cargarTodo}>Actualizar</button>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>

      {error && <p className="error">{error}</p>}
      {loading && <p>Cargando...</p>}

      {tab === "dashboard" && resumen && (
        <section className="stats-grid">
          <article className="stat"><span>Clientes</span><strong>{resumen.clientes}</strong></article>
          <article className="stat"><span>Vehículos en taller</span><strong>{resumen.vehiculosEnTaller}</strong></article>
          <article className="stat"><span>Tareas abiertas</span><strong>{resumen.tareasAbiertas}</strong></article>
          <article className="stat"><span>En proceso</span><strong>{resumen.tareasEnProceso}</strong></article>
          <article className="stat"><span>Cerradas</span><strong>{resumen.tareasCerradas}</strong></article>
          <article className="stat"><span>Vencidas</span><strong>{resumen.tareasVencidas}</strong></article>
          <article className="stat"><span>Stock bajo</span><strong>{resumen.recursosStockBajo}</strong></article>
        </section>
      )}

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
            {clientes.map((c) => <li key={c.id}>{c.nombre} - {c.telefono} - {c.email}</li>)}
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
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <input placeholder="Marca" value={nuevoVehiculo.marca} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, marca: e.target.value })} />
            <input placeholder="Modelo" value={nuevoVehiculo.modelo} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, modelo: e.target.value })} />
            <input placeholder="Patente" value={nuevoVehiculo.patente} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, patente: e.target.value })} />
            <input type="date" value={nuevoVehiculo.fechaEntrada} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, fechaEntrada: e.target.value })} />
            <input type="date" value={nuevoVehiculo.fechaLimite} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, fechaLimite: e.target.value })} />
            <input placeholder="Diagnóstico" value={nuevoVehiculo.diagnostico} onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, diagnostico: e.target.value })} />
            <button type="submit">Agregar</button>
          </form>
          <ul className="list">
            {vehiculos.map((v) => (
              <li key={v.id}>
                {v.patente} - {v.marca} {v.modelo} | {v.cliente?.nombre} | {v.estado}
                {v.estado === "en_taller" && <button className="mini-btn" onClick={() => marcarSalida(v.id)}>Marcar salida</button>}
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
              {vehiculos.map((v) => <option key={v.id} value={v.id}>{v.patente}</option>)}
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
            <input type="date" value={nuevaTarea.fechaLimite} onChange={(e) => setNuevaTarea({ ...nuevaTarea, fechaLimite: e.target.value })} />
            <input type="number" placeholder="Total" value={nuevaTarea.total} onChange={(e) => setNuevaTarea({ ...nuevaTarea, total: e.target.value })} />
            <button type="submit">Crear</button>
          </form>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Vehículo</th><th>Descripción</th><th>Prioridad</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {tareas.map((t) => (
                <tr key={t.id}>
                  <td>#{t.id}</td>
                  <td>{t.vehiculo?.patente || "N/A"}</td>
                  <td>{t.descripcion}</td>
                  <td>{t.prioridad}</td>
                  <td>
                    <select value={t.estado} onChange={(e) => cambiarEstadoTarea(t.id, e.target.value)}>
                      {ESTADOS_TAREA.map((es) => <option key={es} value={es}>{es}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <ul className="list">
            {recursos.map((r) => (
              <li key={r.id}>
                {r.nombre} ({r.tipo}) - Stock: {r.stock} / Min: {r.minimo}
                <button className="mini-btn" onClick={() => consumirRecurso(r.id)}>Consumir 1</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "asistencia" && (
        <section className="card">
          <h2>Asistencia</h2>
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
    </main>
  );
}

export default App;
