const { Router } = require("express");
const db = require("../data/db");

const router = Router();

// Listar clientes
router.get("/", (req, res) => {
  res.json(db.clientes);
});

// Crear cliente
router.post("/", (req, res) => {
  const { nombre, telefono, email } = req.body;

  if (!nombre || !telefono) {
    return res.status(400).json({ error: "nombre y teléfono son obligatorios" });
  }

  const nuevo = {
    id: db.counters.cliente++,
    nombre,
    telefono,
    email: email || ""
  };

  db.clientes.push(nuevo);
  res.status(201).json(nuevo);
});

module.exports = router;
