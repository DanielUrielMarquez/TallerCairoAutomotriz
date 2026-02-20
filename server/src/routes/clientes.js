const { Router } = require("express");
const db = require("../data/db");

const router = Router();

router.get("/", (req, res) => {
  res.json(db.clientes);
});

router.post("/", (req, res) => {
  const { nombre, telefono } = req.body;
  if (!nombre || !telefono) {
    return res.status(400).json({ error: "nombre y telefono son obligatorios" });
  }

  const nuevo = { id: db.counters.cliente++, nombre, telefono };
  db.clientes.push(nuevo);
  res.status(201).json(nuevo);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = db.clientes.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Cliente no encontrado" });

  db.clientes.splice(idx, 1);
  res.status(204).send();
});

module.exports = router;
