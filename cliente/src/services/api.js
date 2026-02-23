// URL base del backend
const API_URL = "http://localhost:4000";
const headers = { "Content-Type": "application/json" };

// Helper para parsear respuestas y devolver error claro
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
  // Auth
  login: async (data) => {
    const r = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    return parseResponse(r);
  },

  // Clientes
  getClientes: async () => {
    const r = await fetch(`${API_URL}/api/clientes`);
    return parseResponse(r);
  },
  createCliente: async (data) => {
    const r = await fetch(`${API_URL}/api/clientes`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    return parseResponse(r);
  },

  // Vehículos
  getVehiculos: async (q = "") => {
    const r = await fetch(`${API_URL}/api/vehiculos?q=${encodeURIComponent(q)}`);
    return parseResponse(r);
  },
  createVehiculo: async (data) => {
    const r = await fetch(`${API_URL}/api/vehiculos`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    return parseResponse(r);
  },
  updateEstadoVehiculo: async (id, estado) => {
    const r = await fetch(`${API_URL}/api/vehiculos/${id}/estado`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ estado })
    });
    return parseResponse(r);
  },

  // Tareas
  getTareas: async () => {
    const r = await fetch(`${API_URL}/api/tareas`);
    return parseResponse(r);
  },
  createTarea: async (data) => {
    const r = await fetch(`${API_URL}/api/tareas`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    return parseResponse(r);
  },
  updateEstadoTarea: async (id, estado) => {
    const r = await fetch(`${API_URL}/api/tareas/${id}/estado`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ estado })
    });
    return parseResponse(r);
  },

  // Recursos
  getRecursos: async () => {
    const r = await fetch(`${API_URL}/api/recursos`);
    return parseResponse(r);
  },
  createRecurso: async (data) => {
    const r = await fetch(`${API_URL}/api/recursos`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    return parseResponse(r);
  },
  consumirRecurso: async (id, cantidad) => {
    const r = await fetch(`${API_URL}/api/recursos/${id}/consumir`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ cantidad })
    });
    return parseResponse(r);
  },
  reponerRecurso: async (id, cantidad) => {
    const r = await fetch(`${API_URL}/api/recursos/${id}/reponer`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ cantidad })
    });
    return parseResponse(r);
  },

  // Asistencias
  getAsistencias: async (fecha = "") => {
    const url = `${API_URL}/api/asistencias${fecha ? `?fecha=${encodeURIComponent(fecha)}` : ""}`;
    const r = await fetch(url);
    return parseResponse(r);
  },
  createAsistencia: async (data) => {
    const r = await fetch(`${API_URL}/api/asistencias`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    return parseResponse(r);
  },

  // Reportes
  getResumen: async () => {
    const r = await fetch(`${API_URL}/api/reportes/resumen`);
    return parseResponse(r);
  }
};
