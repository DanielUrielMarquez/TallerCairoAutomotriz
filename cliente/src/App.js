import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { ESTADOS_TAREA, TABS_BASE, OPCIONES_TAREA } from "./models/ui.constants";
import {
  buildResumenAsistencia,
  calculateTotalTareas,
  buildTrabajadorPorUsuario,
} from "./models/dashboard.helpers";
import LoginView from "./components/auth/loginViews";
import TopBar from "./components/layout/topBar";
import StatsHeader from "./components/layout/statsHeader";
import TabsNav from "./components/layout/tabsNav";
import StatusMessages from "./components/common/statusMessages";
import ClientesPanel from "./components/panels/clientesPanel";
import VehiculosPanel from "./components/panels/vehiculosPanel";
import TareasPanel from "./components/panels/tareasPanel";
import RecursosPanel from "./components/panels/recursosPanel";
import AsistenciaPanel from "./components/panels/asistenciaPanel";
import ReportesPanel from "./components/panels/reportesPanel";
import UsuariosPanel from "./components/panels/usuariosPanel";
import RequireAuth from "./guards/requireAuth";
import RequireRole from "./guards/requireRole";
import { useDashboardData } from "./services/useDashboardData";
import { useAuth } from "./services/useAuth";
import { useWorkshopAct } from "./services/useWorkshopAct";




function App() {
  const [tab, setTab] = useState(() => localStorage.getItem("tab_actual") || "clientes");
const { usuario, loginForm, setLoginForm, onLogin, cerrarSesion } = useAuth({ setTab });

  const esAdmin = usuario?.rol === "administrador";
  const tabsVisibles = esAdmin ? [...TABS_BASE, "usuarios"] : TABS_BASE;
  
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", telefono: "", email: "" });

  const [busquedaVehiculo, setBusquedaVehiculo] = useState("");
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    clienteId: "",
    marca: "",
    modelo: "",
    patente: "",
    fechaEntrada: "",
    fechaLimite: ""
  });

  const [nuevaTarea, setNuevaTarea] = useState({
    vehiculoId: "",
    trabajadorId: "",
    descripcion: "",
    prioridad: "media",
    fechaLimite: "",
    total: ""
  });
  const [otraDescripcionTarea, setOtraDescripcionTarea] = useState("");

  const [nuevoRecurso, setNuevoRecurso] = useState({
    nombre: "",
    tipo: "repuesto",
    stock: "",
    minimo: ""
  });

  const [nuevaAsistencia, setNuevaAsistencia] = useState({
    trabajadorId: "",
    fecha: "",
    estado: "presente"
  });

  const [filtroAsistenciaFecha, setFiltroAsistenciaFecha] = useState("");

  const [nuevoTrabajador, setNuevoTrabajador] = useState({
    username: "",
    password: "",
    nombre: "",
    especialidad: "General"
  });
  useEffect(() => {
<<<<<<< HEAD
    if (usuario) cargarTodo();
  }, [usuario, esAdmin]);

  useEffect(() => {
    localStorage.setItem("tab_actual", tab);
  }, [tab]);

  useEffect(() => {
    if (trabajadores.length && !nuevaAsistencia.trabajadorId) {
      setNuevaAsistencia((prev) => ({
        ...prev,
        trabajadorId: String(trabajadores[0].id)
      }));
    }
  }, [trabajadores, nuevaAsistencia.trabajadorId]);

  async function onLogin(e) {
    e.preventDefault();
    setError("");
    const res = await api.login(loginForm);
    if (res.error) return setError(res.error);
    setUsuario(res.usuario);
    localStorage.setItem("usuario_sesion", JSON.stringify(res.usuario));
  }

  function cerrarSesion() {
    setUsuario(null);
    setTab("clientes");
    setError("");
    setLoginForm({ username: "", password: "" });
    localStorage.removeItem("usuario_sesion");
    localStorage.removeItem("tab_actual");
  }

  async function crearCliente(e) {
    e.preventDefault();
    setError("");
    const res = await api.createCliente(nuevoCliente);
    if (res.error) return setError(res.error);
    setNuevoCliente({ nombre: "", telefono: "", email: "" });
    cargarTodo();
  }

  async function crearVehiculo(e) {
    e.preventDefault();
    setError("");
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
      fechaLimite: ""
    });
    cargarTodo();
  }

  async function cambiarEstadoVehiculo(id, estado) {
    setError("");
    const res = await api.updateEstadoVehiculo(id, estado);
    if (res.error) return setError(res.error);
    cargarTodo();
  }

  async function crearTarea(e) {
    e.preventDefault();
    setError("");

    const descripcionFinal =
      nuevaTarea.descripcion === "__otra__"
        ? otraDescripcionTarea.trim()
        : nuevaTarea.descripcion;

    if (!descripcionFinal) return setError("La descripcion de la tarea es obligatoria");

    const res = await api.createTarea({
      ...nuevaTarea,
      descripcion: descripcionFinal,
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
    setOtraDescripcionTarea("");
    cargarTodo();
  }

  async function cambiarEstadoTarea(id, estado) {
    setError("");
    const res = await api.updateEstadoTarea(id, estado);
    if (res.error) return setError(res.error);
    cargarTodo();
  }

  async function crearRecurso(e) {
    e.preventDefault();
    setError("");
    const res = await api.createRecurso(nuevoRecurso);
    if (res.error) return setError(res.error);
    setNuevoRecurso({ nombre: "", tipo: "repuesto", stock: "", minimo: "" });
    cargarTodo();
  }

  async function consumirRecurso(id) {
    setError("");
    const res = await api.consumirRecurso(id, 1);
    if (res.error) return setError(res.error);
    cargarTodo();
  }

  async function reponerRecurso(id) {
    setError("");
    const res = await api.reponerRecurso(id, 1);
    if (res.error) return setError(res.error);
    cargarTodo();
  }

  async function crearAsistencia(e) {
    e.preventDefault();
    setError("");

    const res = await api.createAsistencia({
      ...nuevaAsistencia,
      trabajadorId: Number(nuevaAsistencia.trabajadorId)
    });

    if (res.error) return setError(res.error);

    setNuevaAsistencia({
      trabajadorId: trabajadores.length ? String(trabajadores[0].id) : "",
      fecha: "",
      estado: "presente"
    });
    cargarTodo();
  }

  async function crearTrabajador(e) {
    e.preventDefault();
    setError("");

    const res = await api.createTrabajador(
      {
        username: nuevoTrabajador.username,
        password: nuevoTrabajador.password,
        nombre: nuevoTrabajador.nombre,
        especialidad: nuevoTrabajador.especialidad
      },
      usuario
    );

    if (res.error) return setError(res.error);

    setNuevoTrabajador({
      username: "",
      password: "",
      nombre: "",
      especialidad: "General"
    });
    cargarTodo();
  }

  async function eliminarTrabajador(usuarioId) {
    setError("");
    const res = await api.deleteTrabajador(usuarioId, usuario);
    if (res.error) return setError(res.error);
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
              placeholder="Contrasena"
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
          <button type="button" onClick={cargarTodo}>Actualizar</button>
          <button type="button" className="btn-logout" onClick={cerrarSesion}>
            Cerrar sesion
          </button>
        </div>
      </header>

      {resumen && (
        <section className="stats-grid always-visible-stats">
          <button type="button" className="stat clickable" onClick={() => setTab("clientes")}>
            <span>Clientes</span><strong>{resumen.clientes}</strong>
          </button>
          <button type="button" className="stat clickable" onClick={() => setTab("vehiculos")}>
            <span>Vehiculos en taller</span><strong>{resumen.vehiculosEnTaller}</strong>
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

          <div className="table-wrap">
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
          </div>
        </section>
      )}

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
              <label htmlFor="vehiculo-fecha-limite">Fecha limite</label>
              <input
                id="vehiculo-fecha-limite"
                type="date"
                value={nuevoVehiculo.fechaLimite}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, fechaLimite: e.target.value })}
              />
            </div>

            <button type="submit">Agregar</button>
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patente</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Cliente</th>
                  <th>Entrada</th>
                  <th>Limite</th>
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
                    <td>{v.fechaEntrada}</td>
                    <td>{v.fechaLimite}</td>
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
          </div>
        </section>
      )}

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

          <div className="table-wrap">
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
          </div>

          <p className="total-tareas">
            Total acumulado de tareas: <strong>${totalTareas.toLocaleString("es-AR")}</strong>
          </p>
        </section>
      )}

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

      {tab === "reportes" && (
        <section className="card">
          <h2>Reportes</h2>
          <ul className="list">
            <li>Clientes registrados: {resumen?.clientes ?? 0}</li>
            <li>Vehiculos en taller: {resumen?.vehiculosEnTaller ?? 0}</li>
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
          <h2>Usuarios / Trabajadores</h2>

          <form className="form" onSubmit={crearTrabajador}>
            <input
              placeholder="Usuario"
              value={nuevoTrabajador.username}
              onChange={(e) => setNuevoTrabajador({ ...nuevoTrabajador, username: e.target.value })}
            />
            <input
              placeholder="Contrasena"
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

          <div className="table-wrap">
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
          </div>
        </section>
      )}
    </main>
  );
=======
  localStorage.setItem("tab_actual", tab);
}, [tab]);

 const {
  loading,
  error,
  setError,
  resumen,
  clientes,
  vehiculos,
  tareas,
  recursos,
  asistencias,
  usuarios,
  trabajadores,
  cargarTodo,
} = useDashboardData({
  usuario,
  esAdmin,
  busquedaVehiculo,
  filtroAsistenciaFecha,
});

async function handleLogin(e) {
  const loginError = await onLogin(e);
  if (loginError) setError(loginError);
>>>>>>> 7c78188128b4364ac7976ad75d8f04dc403375dc
}

function handleLogout() {
  cerrarSesion();
  setError("");
}

  

  const resumenAsistencia = useMemo(
  () => buildResumenAsistencia(asistencias),
  [asistencias]
);

const totalTareas = useMemo(
  () => calculateTotalTareas(tareas),
  [tareas]
);

const trabajadorPorUsuario = useMemo(
  () => buildTrabajadorPorUsuario(trabajadores),
  [trabajadores]
);

const {
  crearCliente,
  crearVehiculo,
  cambiarEstadoVehiculo,
  crearTarea,
  cambiarEstadoTarea,
  crearRecurso,
  consumirRecurso,
  reponerRecurso,
  crearAsistencia,
  crearTrabajador,
  eliminarTrabajador,
} = useWorkshopAct({
  setError,
  cargarTodo,
  usuario,
  nuevoCliente,
  setNuevoCliente,
  nuevoVehiculo,
  setNuevoVehiculo,
  nuevaTarea,
  setNuevaTarea,
  otraDescripcionTarea,
  setOtraDescripcionTarea,
  nuevoRecurso,
  setNuevoRecurso,
  nuevaAsistencia,
  setNuevaAsistencia,
  trabajadores,
  nuevoTrabajador,
  setNuevoTrabajador,
});

  
 
  return (
     <RequireAuth
    usuario={usuario}
    fallback={
      <LoginView
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        onLogin={handleLogin}
        error={error}
      />
    }
  > 
    <main className="layout">
    
    <TopBar usuario={usuario} onRefresh={cargarTodo} onLogout={handleLogout} />
    <StatsHeader resumen={resumen} setTab={setTab} />
    <TabsNav tabsVisibles={tabsVisibles} tab={tab} setTab={setTab} />
    <StatusMessages error={error} loading={loading} />

     <ClientesPanel
  tab={tab}
  nuevoCliente={nuevoCliente}
  setNuevoCliente={setNuevoCliente}
  crearCliente={crearCliente}
  clientes={clientes}/>

      <VehiculosPanel
  tab={tab}
  busquedaVehiculo={busquedaVehiculo}
  setBusquedaVehiculo={setBusquedaVehiculo}
  cargarTodo={cargarTodo}
  nuevoVehiculo={nuevoVehiculo}
  setNuevoVehiculo={setNuevoVehiculo}
  crearVehiculo={crearVehiculo}
  clientes={clientes}
  vehiculos={vehiculos}
  cambiarEstadoVehiculo={cambiarEstadoVehiculo}
/>
<TareasPanel
  tab={tab}
  nuevaTarea={nuevaTarea}
  setNuevaTarea={setNuevaTarea}
  otraDescripcionTarea={otraDescripcionTarea}
  setOtraDescripcionTarea={setOtraDescripcionTarea}
  crearTarea={crearTarea}
  vehiculos={vehiculos}
  trabajadores={trabajadores}
  cambiarEstadoTarea={cambiarEstadoTarea}
  tareas={tareas}
  totalTareas={totalTareas}
  ESTADOS_TAREA={ESTADOS_TAREA}
  OPCIONES_TAREA={OPCIONES_TAREA}
/>
<RecursosPanel
  tab={tab}
  nuevoRecurso={nuevoRecurso}
  setNuevoRecurso={setNuevoRecurso}
  crearRecurso={crearRecurso}
  recursos={recursos}
  consumirRecurso={consumirRecurso}
  reponerRecurso={reponerRecurso}
/>
<AsistenciaPanel
  tab={tab}
  resumenAsistencia={resumenAsistencia}
  filtroAsistenciaFecha={filtroAsistenciaFecha}
  setFiltroAsistenciaFecha={setFiltroAsistenciaFecha}
  cargarTodo={cargarTodo}
  nuevaAsistencia={nuevaAsistencia}
  setNuevaAsistencia={setNuevaAsistencia}
  trabajadores={trabajadores}
  crearAsistencia={crearAsistencia}
  asistencias={asistencias}
/>
<ReportesPanel tab={tab} resumen={resumen} totalTareas={totalTareas} />
<RequireRole allow={esAdmin && tab === "usuarios"}>
  <UsuariosPanel
    tab={tab}
    esAdmin={esAdmin}
    nuevoTrabajador={nuevoTrabajador}
    setNuevoTrabajador={setNuevoTrabajador}
    crearTrabajador={crearTrabajador}
    usuarios={usuarios}
    trabajadorPorUsuario={trabajadorPorUsuario}
    eliminarTrabajador={eliminarTrabajador}
  />
</RequireRole>
    </main>
  </RequireAuth>
  );
}
export default App;