const API_URL = "";
const headers = { "Content-Type": "application/json" };

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

export const api = {
  login: async (data) =>
    parseResponse(await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    })),

  getClientes: async () => parseResponse(await fetch(`${API_URL}/api/clientes`)),
  createCliente: async (data) =>
    parseResponse(await fetch(`${API_URL}/api/clientes`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    })),

  getVehiculos: async (q = "") =>
    parseResponse(await fetch(`${API_URL}/api/vehiculos?q=${encodeURIComponent(q)}`)),
  createVehiculo: async (data) =>
    parseResponse(await fetch(`${API_URL}/api/vehiculos`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    })),
  updateEstadoVehiculo: async (id, estado) =>
    parseResponse(await fetch(`${API_URL}/api/vehiculos/${id}/estado`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ estado })
    })),

  getTareas: async () => parseResponse(await fetch(`${API_URL}/api/tareas`)),
  createTarea: async (data) =>
    parseResponse(await fetch(`${API_URL}/api/tareas`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    })),
  updateEstadoTarea: async (id, estado) =>
    parseResponse(await fetch(`${API_URL}/api/tareas/${id}/estado`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ estado })
    })),

  getRecursos: async () => parseResponse(await fetch(`${API_URL}/api/recursos`)),
  createRecurso: async (data) =>
    parseResponse(await fetch(`${API_URL}/api/recursos`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    })),
  consumirRecurso: async (id, cantidad) =>
    parseResponse(await fetch(`${API_URL}/api/recursos/${id}/consumir`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ cantidad })
    })),
  reponerRecurso: async (id, cantidad) =>
    parseResponse(await fetch(`${API_URL}/api/recursos/${id}/reponer`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ cantidad })
    })),

  getAsistencias: async (fecha = "") =>
    parseResponse(await fetch(`${API_URL}/api/asistencias${fecha ? `?fecha=${encodeURIComponent(fecha)}` : ""}`)),
  createAsistencia: async (data) =>
    parseResponse(await fetch(`${API_URL}/api/asistencias`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    })),

  getResumen: async () => parseResponse(await fetch(`${API_URL}/api/reportes/resumen`))
};
