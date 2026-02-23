const { Router } = require("express");
const db = require("../data/db");

const router = Router();

// Listar recursos/repuestos
router.get("/", (req, res) => {
  res.json(db.recursos);
});

// Crear recurso/repuesto
router.post("/", (req, res) => {
  const { nombre, tipo, stock, minimo } = req.body;

  if (!nombre || !tipo) {
    return res.status(400).json({ error: "nombre y tipo son obligatorios" });
  }

  const nuevo = {
    id: db.counters.recurso++,
    nombre,
    tipo,
    stock: Number(stock) || 0,
    minimo: Number(minimo) || 0
  };

  db.recursos.push(nuevo);
  res.status(201).json(nuevo);
});

// Consumir stock
router.patch("/:id/consumir", (req, res) => {
  const id = Number(req.params.id);
  const cantidad = Number(req.body.cantidad || 0);

  const recurso = db.recursos.find((r) => r.id === id);
  if (!recurso) return res.status(404).json({ error: "Recurso no encontrado" });

  if (cantidad <= 0) return res.status(400).json({ error: "cantidad inválida" });
  if (recurso.stock < cantidad) return res.status(400).json({ error: "stock insuficiente" });

  recurso.stock -= cantidad;
  res.json(recurso);
});

// Reponer stock
router.patch("/:id/reponer", (req, res) => {
  const id = Number(req.params.id);
  const cantidad = Number(req.body.cantidad || 0);

  const recurso = db.recursos.find((r) => r.id === id);
  if (!recurso) return res.status(404).json({ error: "Recurso no encontrado" });

  if (cantidad <= 0) return res.status(400).json({ error: "cantidad inválida" });

  recurso.stock += cantidad;
  res.json(recurso);
});

module.exports = router;
