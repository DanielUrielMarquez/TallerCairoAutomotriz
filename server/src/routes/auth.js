const { Router } = require("express");
const pool = require("../config/db");

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const q = `
      SELECT id, username, rol
      FROM usuarios
      WHERE username = $1 AND password = $2
      LIMIT 1
    `;
    const { rows } = await pool.query(q, [username, password]);

    if (!rows.length) return res.status(401).json({ error: "Credenciales inválidas" });

    res.json({
      token: `fake-token-${rows[0].id}`,
      usuario: rows[0]
    });
  } catch {
    res.status(500).json({ error: "Error interno en login" });
  }
});

module.exports = router;
