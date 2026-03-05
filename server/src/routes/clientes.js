const { Router } = require("express");
const pool = require("../config/db");

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nombre, telefono, email FROM clientes ORDER BY id"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al listar clientes" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nombre, telefono, email } = req.body;

    if (!nombre || !telefono) {
      return res.status(400).json({ error: "nombre y teléfono son obligatorios" });
    }

    const q = `
      INSERT INTO clientes (nombre, telefono, email)
      VALUES ($1, $2, $3)
      RETURNING id, nombre, telefono, email
    `;
    const { rows } = await pool.query(q, [nombre, telefono, email || ""]);
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: "Error al crear cliente" });
  }
});

module.exports = router;
