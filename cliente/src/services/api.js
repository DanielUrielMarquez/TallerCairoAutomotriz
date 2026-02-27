const API_URL = "";

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

// Acá se concentran todas las llamadas al backend para no repetir código en App.js.
export const api = {
  // Login
  login: async (data) =>
    parseResponse(
      await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      })
    ),

  // Resumen dashboard
  getResumen: async () => parseResponse(await fetch(`${API_URL}/api/reportes/resumen`)),

  // Clientes
  getClientes: async () => parseResponse(await fetch(`${API_URL}/api/clientes`)),
  createCliente: async (data) =>
    parseResponse(
      await fetch(`${API_URL}/api/clientes`, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      })
    ),

  // Vehículos
  getVehiculos: async (q = "") =>
    parseResponse(await fetch(`${API_URL}/api/vehiculos?q=${encodeURIComponent(q)}`)),
  createVehiculo: async (data) =>
    parseResponse(
      await fetch(`${API_URL}/api/vehiculos`, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      })
    ),
  updateEstadoVehiculo: async (id, estado) =>
    parseResponse(
      await fetch(`${API_URL}/api/vehiculos/${id}/estado`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ estado })
      })
    ),

  // Tareas
  getTareas: async () => parseResponse(await fetch(`${API_URL}/api/tareas`)),
  createTarea: async (data) =>
    parseResponse(
      await fetch(`${API_URL}/api/tareas`, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      })
    ),
  updateEstadoTarea: async (id, estado) =>
    parseResponse(
      await fetch(`${API_URL}/api/tareas/${id}/estado`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ estado })
      })
    ),

  // Recursos / repuestos
  getRecursos: async () => parseResponse(await fetch(`${API_URL}/api/recursos`)),
  createRecurso: async (data) =>
    parseResponse(
      await fetch(`${API_URL}/api/recursos`, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      })
    ),
  consumirRecurso: async (id, cantidad) =>
    parseResponse(
      await fetch(`${API_URL}/api/recursos/${id}/consumir`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ cantidad })
      })
    ),
  reponerRecurso: async (id, cantidad) =>
    parseResponse(
      await fetch(`${API_URL}/api/recursos/${id}/reponer`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ cantidad })
      })
    ),

  // Asistencias
  getAsistencias: async (fecha = "") =>
    parseResponse(
      await fetch(
        `${API_URL}/api/asistencias${fecha ? `?fecha=${encodeURIComponent(fecha)}` : ""}`
      )
    ),
  createAsistencia: async (data) =>
    parseResponse(
      await fetch(`${API_URL}/api/asistencias`, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      })
    ),

  // Usuarios / trabajadores (solo admin)
    getTrabajadores: async () =>
  parseResponse(await fetch(`${API_URL}/api/trabajadores`)),

getUsuarios: async () => parseResponse(await fetch(`${API_URL}/api/usuarios`)),

createTrabajador: async (data, adminUser) =>
  parseResponse(await fetch(`${API_URL}/api/usuarios/trabajadores`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...data, adminUser })
  })),

deleteTrabajador: async (usuarioId, adminUser) =>
  parseResponse(await fetch(`${API_URL}/api/usuarios/trabajadores/${usuarioId}`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ adminUser })
  })),

};
