const { Router } = require("express");
const pool = require("../config/db");

const router = Router();

function esAdmin(adminUser) {
  return adminUser && adminUser.rol === "administrador";
}

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, username, rol FROM usuarios ORDER BY id"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al listar usuarios" });
  }
});

router.post("/trabajadores", async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, password, nombre, especialidad, adminUser } = req.body;

    if (!esAdmin(adminUser)) {
      return res.status(403).json({ error: "Solo administrador puede crear trabajadores" });
    }

    if (!username || !password || !nombre) {
      return res.status(400).json({ error: "username, password y nombre son obligatorios" });
    }

    await client.query("BEGIN");

    const existe = await client.query(
      "SELECT 1 FROM usuarios WHERE LOWER(username) = LOWER($1)",
      [username]
    );
    if (existe.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    const nuevoUsuario = await client.query(
      `INSERT INTO usuarios (username, password, rol)
       VALUES ($1, $2, 'trabajador')
       RETURNING id, username, rol`,
      [username, password]
    );

    const nuevoTrabajador = await client.query(
      `INSERT INTO trabajadores (usuario_id, nombre, especialidad)
       VALUES ($1, $2, $3)
       RETURNING id, usuario_id AS "usuarioId", nombre, especialidad`,
      [nuevoUsuario.rows[0].id, nombre, especialidad || "General"]
    );

    await client.query("COMMIT");

    res.status(201).json({
      usuario: nuevoUsuario.rows[0],
      trabajador: nuevoTrabajador.rows[0]
    });
  } catch {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Error al crear trabajador" });
  } finally {
    client.release();
  }
});

router.delete("/trabajadores/:usuarioId", async (req, res) => {
  const client = await pool.connect();
  try {
    const usuarioId = Number(req.params.usuarioId);
    const { adminUser } = req.body || {};

    if (!esAdmin(adminUser)) {
      return res.status(403).json({ error: "Solo administrador puede eliminar trabajadores" });
    }

    await client.query("BEGIN");

    const usuario = await client.query(
      "SELECT id, rol FROM usuarios WHERE id = $1",
      [usuarioId]
    );
    if (!usuario.rowCount || usuario.rows[0].rol !== "trabajador") {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Trabajador no encontrado" });
    }

    const trabajador = await client.query(
      "SELECT id FROM trabajadores WHERE usuario_id = $1",
      [usuarioId]
    );

    if (trabajador.rowCount) {
      const trabajadorId = trabajador.rows[0].id;

      const tareas = await client.query(
        "SELECT 1 FROM tareas WHERE trabajador_id = $1 LIMIT 1",
        [trabajadorId]
      );
      const asistencias = await client.query(
        "SELECT 1 FROM asistencias WHERE trabajador_id = $1 LIMIT 1",
        [trabajadorId]
      );

      if (tareas.rowCount || asistencias.rowCount) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          error: "No se puede eliminar: tiene tareas o asistencias asociadas"
        });
      }

      await client.query("DELETE FROM trabajadores WHERE id = $1", [trabajadorId]);
    }

    await client.query("DELETE FROM usuarios WHERE id = $1", [usuarioId]);

    await client.query("COMMIT");
    res.json({ ok: true });
  } catch {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Error al eliminar trabajador" });
  } finally {
    client.release();
  }
});

module.exports = router;
