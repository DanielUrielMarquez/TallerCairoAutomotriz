const { Router } = require("express");
const db = require("../data/db");

const router = Router();

// listar usuarios
router.get("/", (req, res) => {
  res.json(db.usuarios.map(({ password, ...u }) => u));
});

// crear usuario (admin crea mecanicos)
router.post("/", (req, res) => {
  const { username, password, rol, adminUser } = req.body;

  if (adminUser?.rol !== "administrador") {
    return res.status(403).json({ error: "Solo administrador puede crear usuarios" });
  }

  if (!username || !password || !rol) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  if (!["administrador", "trabajador"].includes(rol)) {
    return res.status(400).json({ error: "Rol inválido" });
  }

  const existe = db.usuarios.some((u) => u.username.toLowerCase() === username.toLowerCase());
  if (existe) return res.status(409).json({ error: "El usuario ya existe" });

  const nuevo = { id: db.counters.usuario++, username, password, rol };
  db.usuarios.push(nuevo);

  const { password: _, ...sinPassword } = nuevo;
  res.status(201).json(sinPassword);
});

module.exports = router;
