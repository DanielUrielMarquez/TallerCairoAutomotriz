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
    fechaLimite: "",
  });

  const [nuevaTarea, setNuevaTarea] = useState({
    vehiculoId: "",
    trabajadorId: "",
    descripcion: "",
    prioridad: "media",
    fechaLimite: "",
    total: "",
  });
  const [otraDescripcionTarea, setOtraDescripcionTarea] = useState("");

  const [nuevoRecurso, setNuevoRecurso] = useState({
    nombre: "",
    tipo: "repuesto",
    stock: "",
    minimo: "",
  });

  const [nuevaAsistencia, setNuevaAsistencia] = useState({
    trabajadorId: "",
    fecha: "",
    estado: "presente",
  });

  const [filtroAsistenciaFecha, setFiltroAsistenciaFecha] = useState("");

  const [nuevoTrabajador, setNuevoTrabajador] = useState({
    username: "",
    password: "",
    nombre: "",
    especialidad: "General",
  });

  useEffect(() => {
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

  useEffect(() => {
    if (trabajadores.length && !nuevaAsistencia.trabajadorId) {
      setNuevaAsistencia((prev) => ({
        ...prev,
        trabajadorId: String(trabajadores[0].id),
      }));
    }
  }, [trabajadores, nuevaAsistencia.trabajadorId]);

  async function handleLogin(e) {
    const loginError = await onLogin(e);
    if (loginError) setError(loginError);
  }

  function handleLogout() {
    cerrarSesion();
    setError("");
  }

  const resumenAsistencia = useMemo(() => buildResumenAsistencia(asistencias), [asistencias]);
  const totalTareas = useMemo(() => calculateTotalTareas(tareas), [tareas]);
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
          clientes={clientes}
        />

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
