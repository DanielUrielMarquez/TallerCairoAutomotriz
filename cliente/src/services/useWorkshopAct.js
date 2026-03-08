import { api } from "./api";

export function useWorkshopAct({
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
}) {
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
      clienteId: Number(nuevoVehiculo.clienteId),
    });

    if (res.error) return setError(res.error);

    setNuevoVehiculo({
      clienteId: "",
      marca: "",
      modelo: "",
      patente: "",
    });

    cargarTodo();
  }

  async function cambiarEstadoVehiculo(id, estado) {
    const res = await api.updateEstadoVehiculo(id, estado);
    if (res.error) return setError(res.error);
    cargarTodo();
  }

  async function crearTarea(e) {
    e.preventDefault();

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
      total: Number(nuevaTarea.total || 0),
    });

    if (res.error) return setError(res.error);

    setNuevaTarea({
      vehiculoId: "",
      trabajadorId: "",
      descripcion: "",
      prioridad: "media",
      fechaLimite: "",
      total: "",
    });
    setOtraDescripcionTarea("");

    cargarTodo();
  }

  async function cambiarEstadoTarea(id, estado) {
    const res = await api.updateEstadoTarea(id, estado);
    if (res.error) return setError(res.error);
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
    const res = await api.consumirRecurso(id, 1);
    if (res.error) return setError(res.error);
    cargarTodo();
  }

  async function reponerRecurso(id) {
    const res = await api.reponerRecurso(id, 1);
    if (res.error) return setError(res.error);
    cargarTodo();
  }

  async function crearAsistencia(e) {
    e.preventDefault();

    const res = await api.createAsistencia({
      ...nuevaAsistencia,
      trabajadorId: Number(nuevaAsistencia.trabajadorId),
    });

    if (res.error) return setError(res.error);

    setNuevaAsistencia({
      trabajadorId: trabajadores.length ? String(trabajadores[0].id) : "",
      estado: "presente",
    });

    cargarTodo();
  }

  async function crearTrabajador(e) {
    e.preventDefault();

    const res = await api.createTrabajador(
      {
        username: nuevoTrabajador.username,
        password: nuevoTrabajador.password,
        nombre: nuevoTrabajador.nombre,
        especialidad: nuevoTrabajador.especialidad,
      },
      usuario
    );

    if (res.error) return setError(res.error);

    setNuevoTrabajador({
      username: "",
      password: "",
      nombre: "",
      especialidad: "General",
    });

    cargarTodo();
  }

  async function eliminarTrabajador(usuarioId) {
    const res = await api.deleteTrabajador(usuarioId, usuario);
    if (res.error) return setError(res.error);
    cargarTodo();
  }

  return {
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
  };
}
