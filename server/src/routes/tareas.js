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
        t.orden_id AS "ordenId",
        t.vehiculo_id AS "vehiculoId",
        t.trabajador_id AS "trabajadorId",
        t.descripcion,
        t.estado,
        t.prioridad,
        t.fecha_limite AS "fechaLimite",
        t.total,
        COALESCE(o.created_at, t.created_at) AS "fechaHora",
        v.id AS "v_id",
        v.patente AS "v_patente",
        w.id AS "w_id",
        w.nombre AS "w_nombre",
        w.especialidad AS "w_especialidad"
      FROM tareas t
      LEFT JOIN ordenes o ON o.id = t.orden_id
      JOIN vehiculos v ON v.id = t.vehiculo_id
      JOIN trabajadores w ON w.id = t.trabajador_id
      ORDER BY t.id
    `);

    const data = rows.map((r) => ({
      id: r.id,
      ordenId: r.ordenId,
      vehiculoId: r.vehiculoId,
      trabajadorId: r.trabajadorId,
      descripcion: r.descripcion,
      estado: r.estado,
      prioridad: r.prioridad,
      fechaLimite: r.fechaLimite,
      total: Number(r.total || 0),
      fechaHora: r.fechaHora,
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
    const { ordenId, vehiculoId, trabajadorId, descripcion, prioridad, fechaLimite, total } = req.body;

    if (!vehiculoId || !trabajadorId || !descripcion || !fechaLimite) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const vehiculo = await pool.query("SELECT id FROM vehiculos WHERE id = $1", [Number(vehiculoId)]);
    const trabajador = await pool.query("SELECT id FROM trabajadores WHERE id = $1", [Number(trabajadorId)]);
    if (!vehiculo.rowCount || !trabajador.rowCount) {
      return res.status(400).json({ error: "vehiculoId o trabajadorId inválido" });
    }
    if (ordenId) {
      const orden = await pool.query("SELECT id FROM ordenes WHERE id = $1", [Number(ordenId)]);
      if (!orden.rowCount) return res.status(400).json({ error: "ordenId inválido" });
    }

    const insert = await pool.query(
      `
      INSERT INTO tareas (
        orden_id, vehiculo_id, trabajador_id, descripcion, estado, prioridad, fecha_limite, total
      )
      VALUES ($1, $2, $3, $4, 'abierta', $5, $6, $7)
      RETURNING
        id,
        orden_id AS "ordenId",
        vehiculo_id AS "vehiculoId",
        trabajador_id AS "trabajadorId",
        descripcion,
        estado,
        prioridad,
        fecha_limite AS "fechaLimite",
        total
      `,
      [
        ordenId ? Number(ordenId) : null,
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
        orden_id AS "ordenId",
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

    const tareaActualizada = update.rows[0];
    if (tareaActualizada.ordenId) {
      await pool.query(
        `UPDATE ordenes
         SET estado = $1
         WHERE id = $2`,
        [estado, Number(tareaActualizada.ordenId)]
      );
    }

    res.json(tareaActualizada);
  } catch {
    res.status(500).json({ error: "Error al actualizar estado de tarea" });
  }
});

module.exports = router;
