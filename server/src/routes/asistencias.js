const { Router } = require("express");
const db = require("../data/db");

const router = Router();
const ESTADOS = ["presente", "ausente", "tarde"];

// Listar asistencias (con filtro por fecha opcional)
router.get("/", (req, res) => {
  const { fecha } = req.query;

  let data = db.asistencias.map((a) => ({
    ...a,
    trabajador: db.trabajadores.find((w) => w.id === a.trabajadorId) || null
  }));

  if (fecha) data = data.filter((a) => a.fecha === fecha);

  // Más reciente primero
  data.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  res.json(data);
});

// Crear asistencia (sin duplicar trabajador + fecha)
router.post("/", (req, res) => {
  const { trabajadorId, fecha, estado } = req.body;

  if (!trabajadorId || !fecha || !ESTADOS.includes(estado)) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  const trabajadorExiste = db.trabajadores.some((w) => w.id === Number(trabajadorId));
  if (!trabajadorExiste) return res.status(400).json({ error: "trabajadorId inválido" });

  const duplicado = db.asistencias.some(
    (a) => a.trabajadorId === Number(trabajadorId) && a.fecha === fecha
  );
  if (duplicado) {
    return res.status(409).json({ error: "Ese trabajador ya tiene asistencia cargada en esa fecha" });
  }

  const nueva = {
    id: db.counters.asistencia++,
    trabajadorId: Number(trabajadorId),
    fecha,
    estado
  };

  db.asistencias.push(nueva);
  res.status(201).json(nueva);
});

module.exports = router;
