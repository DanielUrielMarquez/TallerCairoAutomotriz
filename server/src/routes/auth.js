const { Router } = require("express");
const db = require("../data/db");

const router = Router();

// Login simple por usuario/contraseña
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = db.usuarios.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  // Token fake (solo para práctica)
  res.json({
    token: `fake-token-${user.id}`,
    usuario: { id: user.id, username: user.username, rol: user.rol }
  });
});

module.exports = router;
