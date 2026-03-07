import { useEffect, useState } from "react";
import { api } from "./api";

export function useDashboardData({
  usuario,
  esAdmin,
  busquedaVehiculo,
  filtroAsistenciaFecha,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [resumen, setResumen] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);

  async function cargarTodo() {
    try {
      setLoading(true);
      setError("");

      const [r, c, v, t, rc, a, w, u] = await Promise.all([
        api.getResumen(),
        api.getClientes(),
        api.getVehiculos(busquedaVehiculo),
        api.getTareas(),
        api.getRecursos(),
        api.getAsistencias(filtroAsistenciaFecha),
        api.getTrabajadores(),
        esAdmin ? api.getUsuarios() : Promise.resolve([]),
      ]);

      const fallo = [r, c, v, t, rc, a, w, u].find((x) => x?.error);
      if (fallo) throw new Error(fallo.error);

      setResumen(r);
      setClientes(c);
      setVehiculos(v);
      setTareas(t);
      setRecursos(rc);
      setAsistencias(a);
      setTrabajadores(Array.isArray(w) ? w : []);
      setUsuarios(Array.isArray(u) ? u : []);
    } catch (e) {
      setError(`No se pudo cargar la informacion: ${e.message || "error inesperado"}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (usuario) cargarTodo();
  }, [usuario, esAdmin]);

  return {
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
  };
}
