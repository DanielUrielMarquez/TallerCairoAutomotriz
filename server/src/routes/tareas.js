const { Router } = require("express");
const db = require("../data/db");

const router = Router();
const ESTADOS = ["abierta", "en_proceso", "cerrada"];

// Listar tareas con vehículo y trabajador
router.get("/", (req, res) => {
  const data = db.tareas.map((t) => ({
    ...t,
    vehiculo: db.vehiculos.find((v) => v.id === t.vehiculoId) || null,
    trabajador: db.trabajadores.find((w) => w.id === t.trabajadorId) || null
  }));

  res.json(data);
});

// Crear tarea
router.post("/", (req, res) => {
  const { vehiculoId, trabajadorId, descripcion, prioridad, fechaLimite, total } = req.body;

  if (!vehiculoId || !trabajadorId || !descripcion || !fechaLimite) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const vehiculoExiste = db.vehiculos.some((v) => v.id === Number(vehiculoId));
  const trabajadorExiste = db.trabajadores.some((w) => w.id === Number(trabajadorId));
  if (!vehiculoExiste || !trabajadorExiste) {
    return res.status(400).json({ error: "vehiculoId o trabajadorId inválido" });
  }

  const nueva = {
    id: db.counters.tarea++,
    vehiculoId: Number(vehiculoId),
    trabajadorId: Number(trabajadorId),
    descripcion,
    prioridad: prioridad || "media",
    fechaLimite,
    total: Number(total) || 0,
    estado: "abierta"
  };

  db.tareas.push(nueva);
  res.status(201).json(nueva);
});

// Cambiar estado de tarea
router.patch("/:id/estado", (req, res) => {
  const id = Number(req.params.id);
  const { estado } = req.body;

  if (!ESTADOS.includes(estado)) {
    return res.status(400).json({ error: "estado inválido" });
  }

  const tarea = db.tareas.find((t) => t.id === id);
  if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });

  tarea.estado = estado;
  res.json(tarea);
});

module.exports = router;
