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
import OrdenesPanel from "./components/panels/ordenesPanel";
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
import {
  exportRecursosToExcel,
  parseRecursosFromExcel,
  exportErroresImportacionToExcel,
  exportResumenToExcel,
  exportPedidoMayoristaToExcel,
} from "./services/excel";
import { api } from "./services/api";
import MisTareasPanel from "./components/panels/misTareasPanel";





function App() {
  const [tab, setTab] = useState(() => localStorage.getItem("tab_actual") || "clientes");
const { usuario, loginForm, setLoginForm, onLogin, cerrarSesion } = useAuth({ setTab });

  const esAdmin = usuario?.rol === "administrador";
  const tabsVisibles = esAdmin
    ? [...TABS_BASE, "usuarios"]
    : TABS_BASE.filter((t) => t !== "tareas");
  
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", telefono: "", email: "" });

  const [busquedaVehiculo, setBusquedaVehiculo] = useState("");
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    clienteId: "",
    marca: "",
    modelo: "",
    patente: ""
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
    estado: "presente"
  });

  const [filtroAsistenciaFecha, setFiltroAsistenciaFecha] = useState("");

  const [nuevoTrabajador, setNuevoTrabajador] = useState({
    username: "",
    password: "",
    nombre: "",
    especialidad: "General"
  });
  const [mostrarStockBajoModal, setMostrarStockBajoModal] = useState(false);
  useEffect(() => {
  localStorage.setItem("tab_actual", tab);
}, [tab]);

  useEffect(() => {
    if (!esAdmin && tab === "tareas") setTab("mis_tareas");
  }, [esAdmin, tab]);

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
  const [resultadoImportacion, setResultadoImportacion] = useState(null);

async function handleLogin(e) {
  const loginError = await onLogin(e);
  if (loginError) setError(loginError);
}
function exportarResumen() {
  exportResumenToExcel(resumen, totalTareas);
}

function exportarPedidoMayorista() {
  if (!recursosStockBajo.length) {
    setError("No hay materiales con stock bajo para exportar.");
    return;
  }
  exportPedidoMayoristaToExcel(recursosStockBajo);
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
const recursosStockBajo = useMemo(
  () => recursos.filter((r) => Number(r.stock) <= Number(r.minimo)),
  [recursos]
);

const trabajadorPorUsuario = useMemo(
  () => buildTrabajadorPorUsuario(trabajadores),
  [trabajadores]
);

useEffect(() => {
  if (!nuevaAsistencia.trabajadorId && trabajadores.length) {
    setNuevaAsistencia((prev) => ({ ...prev, trabajadorId: String(trabajadores[0].id) }));
  }
}, [trabajadores, nuevaAsistencia.trabajadorId]);

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
    <StatsHeader
      resumen={resumen}
      setTab={setTab}
      onStockAlertClick={() => setMostrarStockBajoModal(true)}
    />
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
<OrdenesPanel
  tab={tab}
  clientes={clientes}
  vehiculos={vehiculos}
  trabajadores={trabajadores}
  setError={setError}
/>
<RequireRole allow={esAdmin && tab === "tareas"}>
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
</RequireRole>
<RecursosPanel
  tab={tab}
  nuevoRecurso={nuevoRecurso}
  setNuevoRecurso={setNuevoRecurso}
  crearRecurso={crearRecurso}
  recursos={recursos}
  consumirRecurso={consumirRecurso}
  reponerRecurso={reponerRecurso}
  exportarRecursos={exportarRecursos}
  importarRecursosExcel={importarRecursosExcel}
  resultadoImportacion={resultadoImportacion}
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
<ReportesPanel
  tab={tab}
  resumen={resumen}
  totalTareas={totalTareas}
  exportarResumen={exportarResumen}
/>
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
<MisTareasPanel
  tab={tab}
  usuario={usuario}
  tareas={tareas}
  trabajadorPorUsuario={trabajadorPorUsuario}
  cambiarEstadoTarea={cambiarEstadoTarea}
  ESTADOS_TAREA={ESTADOS_TAREA}
/>

{mostrarStockBajoModal && (
  <section className="card">
    <h2>Materiales con stock bajo</h2>
    {!recursosStockBajo.length ? (
      <p>No hay materiales con stock bajo.</p>
    ) : (
      <ul className="list">
        {recursosStockBajo.map((r) => {
  const stock = Number(r.stock) || 0;
  const minimo = Number(r.minimo) || 0;
  const objetivo = Math.ceil(minimo * 1.5);
  const pedir = Math.max(0, objetivo - stock);

  return (
    <li key={r.id}>
      {r.nombre} ({r.tipo}) - Stock: {stock}, Minimo: {minimo}, Objetivo: {objetivo}, Pedido sugerido: {pedir}
    </li>
  );
})}
      </ul>
    )}
    <button
  type="button"
  onClick={exportarPedidoMayorista}
>
  Exportar pedido mayorista
</button>

    <button type="button" onClick={() => setMostrarStockBajoModal(false)}>
      Cerrar
    </button>
    
  </section>
)}
    </main>
  </RequireAuth>
  );
  function exportarRecursos() {
  exportRecursosToExcel(recursos);
}
async function importarRecursosExcel(file) {
  setResultadoImportacion(null);
  try {
    setError("");

    const { ok, errores, total } = await parseRecursosFromExcel(file);

    if (!ok.length) {
      setResultadoImportacion({
        total,
        importadas: 0,
        fallidas: errores.length,
      });
      return setError(
        `Archivo sin filas válidas. Total: ${total}. Con error: ${errores.length}.`
      );
    }

    let importadas = 0;
    const erroresImportacion = [...errores];

    for (const recurso of ok) {
      const res = await api.createRecurso(recurso);
      if (res.error) {
        erroresImportacion.push({
          fila: "-",
          motivo: `API: ${res.error}`,
          original: recurso,
        });
      } else {
        importadas += 1;
      }
    }

    await cargarTodo();

    if (erroresImportacion.length) {
      setResultadoImportacion({
        total,
        importadas,
        fallidas: erroresImportacion.length,
      });
      setError(
        `Importación parcial: ${importadas}/${total} filas importadas. ` +
          `Fallidas: ${erroresImportacion.length}.`
      );
      exportErroresImportacionToExcel(erroresImportacion);
      console.table(erroresImportacion);
      return;
    }

    setResultadoImportacion({
      total,
      importadas,
      fallidas: 0,
    });
    setError("");
  } catch {
    setError("No se pudo leer el archivo Excel.");
  }
}


}
export default App;
