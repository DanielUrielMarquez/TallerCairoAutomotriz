const { Router } = require("express");
const db = require("../data/db");

const router = Router();

router.get("/", (req, res) => {
  const data = db.asistencias.map((a) => ({
    ...a,
    trabajador: db.trabajadores.find((w) => w.id === a.trabajadorId) || null
  }));
  res.json(data);
});

router.post("/", (req, res) => {
  const { trabajadorId, fecha, estado } = req.body;
  const validos = ["presente", "ausente", "tarde"];

  if (!trabajadorId || !fecha || !validos.includes(estado)) {
    return res.status(400).json({ error: "Datos invalidos" });
  }

  const trabajadorExiste = db.trabajadores.some((w) => w.id === Number(trabajadorId));
  if (!trabajadorExiste) return res.status(400).json({ error: "trabajadorId invalido" });

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
