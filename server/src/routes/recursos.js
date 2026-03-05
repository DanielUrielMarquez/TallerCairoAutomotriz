const { Router } = require("express");
const pool = require("../config/db");

const router = Router();

// Listar recursos/repuestos
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nombre, tipo, stock, minimo FROM recursos ORDER BY id"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al listar recursos" });
  }
});

// Crear recurso/repuesto
router.post("/", async (req, res) => {
  try {
    const { nombre, tipo, stock, minimo } = req.body;

    if (!nombre || !tipo) {
      return res.status(400).json({ error: "nombre y tipo son obligatorios" });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO recursos (nombre, tipo, stock, minimo)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, tipo, stock, minimo
      `,
      [nombre, tipo, Number(stock) || 0, Number(minimo) || 0]
    );

    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: "Error al crear recurso" });
  }
});

// Consumir stock
router.patch("/:id/consumir", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const cantidad = Number(req.body.cantidad || 0);

    if (cantidad <= 0) return res.status(400).json({ error: "cantidad inválida" });

    const r = await pool.query(
      "SELECT id, stock FROM recursos WHERE id = $1",
      [id]
    );
    if (!r.rowCount) return res.status(404).json({ error: "Recurso no encontrado" });

    if (r.rows[0].stock < cantidad) {
      return res.status(400).json({ error: "stock insuficiente" });
    }

    const { rows } = await pool.query(
      `
      UPDATE recursos
      SET stock = stock - $1
      WHERE id = $2
      RETURNING id, nombre, tipo, stock, minimo
      `,
      [cantidad, id]
    );

    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Error al consumir recurso" });
  }
});

// Reponer stock
router.patch("/:id/reponer", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const cantidad = Number(req.body.cantidad || 0);

    if (cantidad <= 0) return res.status(400).json({ error: "cantidad inválida" });

    const r = await pool.query("SELECT id FROM recursos WHERE id = $1", [id]);
    if (!r.rowCount) return res.status(404).json({ error: "Recurso no encontrado" });

    const { rows } = await pool.query(
      `
      UPDATE recursos
      SET stock = stock + $1
      WHERE id = $2
      RETURNING id, nombre, tipo, stock, minimo
      `,
      [cantidad, id]
    );

    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Error al reponer recurso" });
  }
});

module.exports = router;
