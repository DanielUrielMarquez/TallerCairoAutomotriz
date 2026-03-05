const { Router } = require("express");
const pool = require("../config/db");

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, usuario_id AS \"usuarioId\", nombre, especialidad FROM trabajadores ORDER BY id"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al listar trabajadores" });
  }
});

module.exports = router;
