const { Router } = require("express");
const pool = require("../config/db");

const router = Router();
const ESTADOS = ["abierta", "en_proceso", "cerrada"];

// Listar tareas con vehículo y trabajador
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        t.id,
        t.vehiculo_id AS "vehiculoId",
        t.trabajador_id AS "trabajadorId",
        t.descripcion,
        t.estado,
        t.prioridad,
        t.fecha_limite AS "fechaLimite",
        t.total,
        v.id AS "v_id",
        v.patente AS "v_patente",
        w.id AS "w_id",
        w.nombre AS "w_nombre",
        w.especialidad AS "w_especialidad"
      FROM tareas t
      JOIN vehiculos v ON v.id = t.vehiculo_id
      JOIN trabajadores w ON w.id = t.trabajador_id
      ORDER BY t.id
    `);

    const data = rows.map((r) => ({
      id: r.id,
      vehiculoId: r.vehiculoId,
      trabajadorId: r.trabajadorId,
      descripcion: r.descripcion,
      estado: r.estado,
      prioridad: r.prioridad,
      fechaLimite: r.fechaLimite,
      total: Number(r.total || 0),
      vehiculo: {
        id: r.v_id,
        patente: r.v_patente
      },
      trabajador: {
        id: r.w_id,
        nombre: r.w_nombre,
        especialidad: r.w_especialidad
      }
    }));

    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al listar tareas" });
  }
});

// Crear tarea
router.post("/", async (req, res) => {
  try {
    const { vehiculoId, trabajadorId, descripcion, prioridad, fechaLimite, total } = req.body;

    if (!vehiculoId || !trabajadorId || !descripcion || !fechaLimite) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const vehiculo = await pool.query("SELECT id FROM vehiculos WHERE id = $1", [Number(vehiculoId)]);
    const trabajador = await pool.query("SELECT id FROM trabajadores WHERE id = $1", [Number(trabajadorId)]);
    if (!vehiculo.rowCount || !trabajador.rowCount) {
      return res.status(400).json({ error: "vehiculoId o trabajadorId inválido" });
    }

    const insert = await pool.query(
      `
      INSERT INTO tareas (
        vehiculo_id, trabajador_id, descripcion, estado, prioridad, fecha_limite, total
      )
      VALUES ($1, $2, $3, 'abierta', $4, $5, $6)
      RETURNING
        id,
        vehiculo_id AS "vehiculoId",
        trabajador_id AS "trabajadorId",
        descripcion,
        estado,
        prioridad,
        fecha_limite AS "fechaLimite",
        total
      `,
      [
        Number(vehiculoId),
        Number(trabajadorId),
        descripcion,
        prioridad || "media",
        fechaLimite,
        Number(total) || 0
      ]
    );

    res.status(201).json(insert.rows[0]);
  } catch {
    res.status(500).json({ error: "Error al crear tarea" });
  }
});

// Cambiar estado de tarea
router.patch("/:id/estado", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;

    if (!ESTADOS.includes(estado)) {
      return res.status(400).json({ error: "estado inválido" });
    }

    const update = await pool.query(
      `
      UPDATE tareas
      SET estado = $1
      WHERE id = $2
      RETURNING
        id,
        vehiculo_id AS "vehiculoId",
        trabajador_id AS "trabajadorId",
        descripcion,
        estado,
        prioridad,
        fecha_limite AS "fechaLimite",
        total
      `,
      [estado, id]
    );

    if (!update.rowCount) return res.status(404).json({ error: "Tarea no encontrada" });

    res.json(update.rows[0]);
  } catch {
    res.status(500).json({ error: "Error al actualizar estado de tarea" });
  }
});

module.exports = router;
