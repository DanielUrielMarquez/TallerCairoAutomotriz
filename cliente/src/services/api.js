const API_URL = "http://localhost:4000";
const headers = { "Content-Type": "application/json" };

export const api = {
  login: (data) =>
    fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    }).then((r) => r.json()),

  getClientes: () => fetch(`${API_URL}/api/clientes`).then((r) => r.json()),
  createCliente: (data) =>
    fetch(`${API_URL}/api/clientes`, { method: "POST", headers, body: JSON.stringify(data) }).then((r) => r.json()),

  getVehiculos: (q = "") =>
    fetch(`${API_URL}/api/vehiculos?q=${encodeURIComponent(q)}`).then((r) => r.json()),
  createVehiculo: (data) =>
    fetch(`${API_URL}/api/vehiculos`, { method: "POST", headers, body: JSON.stringify(data) }).then((r) => r.json()),
  registrarSalidaVehiculo: (id, fechaSalida) =>
    fetch(`${API_URL}/api/vehiculos/${id}/salida`, { method: "PATCH", headers, body: JSON.stringify({ fechaSalida }) }).then((r) => r.json()),

  getTareas: () => fetch(`${API_URL}/api/tareas`).then((r) => r.json()),
  createTarea: (data) =>
    fetch(`${API_URL}/api/tareas`, { method: "POST", headers, body: JSON.stringify(data) }).then((r) => r.json()),
  updateEstadoTarea: (id, estado) =>
    fetch(`${API_URL}/api/tareas/${id}/estado`, { method: "PATCH", headers, body: JSON.stringify({ estado }) }).then((r) => r.json()),

  getRecursos: () => fetch(`${API_URL}/api/recursos`).then((r) => r.json()),
  createRecurso: (data) =>
    fetch(`${API_URL}/api/recursos`, { method: "POST", headers, body: JSON.stringify(data) }).then((r) => r.json()),
  consumirRecurso: (id, cantidad) =>
    fetch(`${API_URL}/api/recursos/${id}/consumir`, { method: "PATCH", headers, body: JSON.stringify({ cantidad }) }).then((r) => r.json()),

  getAsistencias: () => fetch(`${API_URL}/api/asistencias`).then((r) => r.json()),
  createAsistencia: (data) =>
    fetch(`${API_URL}/api/asistencias`, { method: "POST", headers, body: JSON.stringify(data) }).then((r) => r.json()),

  getResumen: () => fetch(`${API_URL}/api/reportes/resumen`).then((r) => r.json())
};
