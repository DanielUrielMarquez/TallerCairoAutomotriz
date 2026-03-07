const API_URL = process.env.REACT_APP_API_URL || "";

const headers = { "Content-Type": "application/json" };

// Esta función sirve para leer cualquier respuesta del backend
// y manejar errores de forma pareja en toda la app.
async function parseResponse(r) {
  const text = await r.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || "Error inesperado" };
  }

  if (!r.ok) return { error: data.error || `HTTP ${r.status}` };
  return data;
}

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, options);
    return parseResponse(response);
  } catch {
    return { error: "No se pudo conectar al servidor" };
  }
}

// Acá se concentran todas las llamadas al backend para no repetir código en App.js.
export const api = {
  // Login
  login: async (data) =>
    request("/api/auth/login", {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    }),

  // Resumen dashboard
  getResumen: async () => request("/api/reportes/resumen"),

  // Clientes
  getClientes: async () => request("/api/clientes"),
  createCliente: async (data) =>
    request("/api/clientes", {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    }),

  // Vehículos
  getVehiculos: async (q = "") =>
    request(`/api/vehiculos?q=${encodeURIComponent(q)}`),
  createVehiculo: async (data) =>
    request("/api/vehiculos", {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    }),
  updateEstadoVehiculo: async (id, estado) =>
    request(`/api/vehiculos/${id}/estado`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ estado })
    }),

  // Tareas
  getTareas: async () => request("/api/tareas"),
  createTarea: async (data) =>
    request("/api/tareas", {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    }),
  updateEstadoTarea: async (id, estado) =>
    request(`/api/tareas/${id}/estado`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ estado })
    }),

  // Recursos / repuestos
  getRecursos: async () => request("/api/recursos"),
  createRecurso: async (data) =>
    request("/api/recursos", {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    }),
  consumirRecurso: async (id, cantidad) =>
    request(`/api/recursos/${id}/consumir`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ cantidad })
    }),
  reponerRecurso: async (id, cantidad) =>
    request(`/api/recursos/${id}/reponer`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ cantidad })
    }),

  // Asistencias
  getAsistencias: async (fecha = "") =>
    request(`/api/asistencias${fecha ? `?fecha=${encodeURIComponent(fecha)}` : ""}`),
  createAsistencia: async (data) =>
    request("/api/asistencias", {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    }),

  // Usuarios / trabajadores (solo admin)
  getTrabajadores: async () => request("/api/trabajadores"),

  getUsuarios: async () => request("/api/usuarios"),

  createTrabajador: async (data, adminUser) =>
    request("/api/usuarios/trabajadores", {
      method: "POST",
      headers,
      body: JSON.stringify({ ...data, adminUser })
    }),

  deleteTrabajador: async (usuarioId, adminUser) =>
    request(`/api/usuarios/trabajadores/${usuarioId}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ adminUser })
    }),

};
