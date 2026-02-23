// Esta es la "base de datos" en memoria del proyecto.
// Acá guardamos usuarios, clientes, vehículos, tareas, recursos y asistencias.

const db = {
  // Usuarios para login
  usuarios: [
    { id: 1, username: "admin", password: "1234", rol: "administrador" },
    { id: 2, username: "mecanico1", password: "1234", rol: "trabajador" }
  ],

  // Clientes del taller
  clientes: [
    { id: 1, nombre: "Juan Perez", telefono: "1122334455", email: "juan@mail.com" }
  ],

  // Trabajadores que pueden tener tareas/asistencia
  trabajadores: [
    { id: 1, nombre: "Carlos Mena", especialidad: "Motor" },
    { id: 2, nombre: "Luis Rios", especialidad: "Electricidad" }
  ],

  // Vehículos ingresados al taller
  vehiculos: [
    {
      id: 1,
      clienteId: 1, // referencia al cliente
      marca: "Ford",
      modelo: "Focus",
      patente: "AA123BB",
      fechaEntrada: "2026-02-20", // fecha en que entra al taller
      fechaLimite: "2026-02-25", // fecha compromiso
      fechaSalida: null, // se completa cuando se entrega
      diagnostico: "Cambio de aceite y filtro", // problema inicial
      estado: "en_taller" // en_taller | reingresado | entregado
    }
  ],

  // Tareas asociadas a vehículos
  tareas: [
    {
      id: 1,
      vehiculoId: 1, // referencia al vehículo
      trabajadorId: 1, // referencia al trabajador
      descripcion: "Cambio de aceite",
      estado: "abierta", // abierta | en_proceso | cerrada
      prioridad: "media",
      fechaLimite: "2026-02-24",
      total: 15000 // costo de la tarea
    }
  ],

  // Recursos/repuestos con control de stock
  recursos: [
    { id: 1, nombre: "Filtro de aceite", tipo: "repuesto", stock: 12, minimo: 5 },
    { id: 2, nombre: "Aceite 5W30", tipo: "insumo", stock: 20, minimo: 8 }
  ],

  // Asistencias de trabajadores
  asistencias: [
    { id: 1, trabajadorId: 1, fecha: "2026-02-20", estado: "presente" }
  ],

  // Contadores para generar IDs nuevos
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

// Exportamos db para usarla en las rutas
module.exports = db;
