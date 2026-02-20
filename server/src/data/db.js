const db = {
  usuarios: [
    { id: 1, username: "admin", password: "1234", rol: "administrador" },
    { id: 2, username: "mecanico1", password: "1234", rol: "trabajador" }
  ],
  clientes: [
    { id: 1, nombre: "Juan Perez", telefono: "1122334455", email: "juan@mail.com" }
  ],
  trabajadores: [
    { id: 1, nombre: "Carlos Mena", especialidad: "Motor" },
    { id: 2, nombre: "Luis Rios", especialidad: "Electricidad" }
  ],
  vehiculos: [
    {
      id: 1,
      clienteId: 1,
      marca: "Ford",
      modelo: "Focus",
      patente: "AA123BB",
      fechaEntrada: "2026-02-20",
      fechaLimite: "2026-02-25",
      fechaSalida: null,
      diagnostico: "Cambio de aceite y filtro",
      estado: "en_taller"
    }
  ],
  tareas: [
    {
      id: 1,
      vehiculoId: 1,
      trabajadorId: 1,
      descripcion: "Cambio de aceite",
      estado: "abierta",
      prioridad: "media",
      fechaLimite: "2026-02-24",
      total: 15000
    }
  ],
  recursos: [
    { id: 1, nombre: "Filtro de aceite", tipo: "repuesto", stock: 12, minimo: 5 },
    { id: 2, nombre: "Aceite 5W30", tipo: "insumo", stock: 20, minimo: 8 }
  ],
  asistencias: [
    { id: 1, trabajadorId: 1, fecha: "2026-02-20", estado: "presente" }
  ],
  counters: {
    usuario: 3,
    cliente: 2,
    trabajador: 3,
    vehiculo: 2,
    tarea: 2,
    recurso: 3,
    asistencia: 2
  }
};

module.exports = db;
