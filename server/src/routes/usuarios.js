const { Router } = require("express");
const db = require("../data/db");

const router = Router();

function esAdmin(adminUser) {
  return adminUser && adminUser.rol === "administrador";
}

router.get("/", (req, res) => {
  res.json(db.usuarios.map(({ password, ...u }) => u));
});

router.post("/trabajadores", (req, res) => {
  const { username, password, nombre, especialidad, adminUser } = req.body;

  if (!esAdmin(adminUser)) {
    return res.status(403).json({ error: "Solo administrador puede crear trabajadores" });
  }

  if (!username || !password || !nombre) {
    return res.status(400).json({ error: "username, password y nombre son obligatorios" });
  }

  const existe = db.usuarios.some((u) => u.username.toLowerCase() === username.toLowerCase());
  if (existe) return res.status(409).json({ error: "El usuario ya existe" });

  const nuevoUsuario = {
    id: db.counters.usuario++,
    username,
    password,
    rol: "trabajador"
  };
  db.usuarios.push(nuevoUsuario);

  const nuevoTrabajador = {
    id: db.counters.trabajador++,
    usuarioId: nuevoUsuario.id,
    nombre,
    especialidad: especialidad || "General"
  };
  db.trabajadores.push(nuevoTrabajador);

  res.status(201).json({
    usuario: { id: nuevoUsuario.id, username: nuevoUsuario.username, rol: nuevoUsuario.rol },
    trabajador: nuevoTrabajador
  });
});

router.delete("/trabajadores/:usuarioId", (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const { adminUser } = req.body || {};

  if (!esAdmin(adminUser)) {
    return res.status(403).json({ error: "Solo administrador puede eliminar trabajadores" });
  }

  const idxUsuario = db.usuarios.findIndex((u) => u.id === usuarioId && u.rol === "trabajador");
  if (idxUsuario === -1) {
    return res.status(404).json({ error: "Trabajador no encontrado" });
  }

  const trabajador = db.trabajadores.find((t) => t.usuarioId === usuarioId);
  if (trabajador) {
    const tieneTareas = db.tareas.some((t) => t.trabajadorId === trabajador.id);
    const tieneAsistencias = db.asistencias.some((a) => a.trabajadorId === trabajador.id);

    if (tieneTareas || tieneAsistencias) {
      return res.status(409).json({
        error: "No se puede eliminar: tiene tareas o asistencias asociadas"
      });
    }

    const idxTrabajador = db.trabajadores.findIndex((t) => t.usuarioId === usuarioId);
    if (idxTrabajador !== -1) db.trabajadores.splice(idxTrabajador, 1);
  }

  db.usuarios.splice(idxUsuario, 1);
  res.json({ ok: true });
});

module.exports = router;
