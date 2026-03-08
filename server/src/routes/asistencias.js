const { Router } = require("express");
const pool = require("../config/db");

const router = Router();
const ESTADOS = ["presente", "ausente", "tarde"];

function fechaHoyArgentinaISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires"
  }).format(new Date());
}

// Listar asistencias con filtro por fecha opcional
router.get("/", async (req, res) => {
  try {
    const { fecha } = req.query;
    const params = [];
    let where = "";

    if (fecha) {
      where = "WHERE a.fecha = $1";
      params.push(fecha);
    }

    const { rows } = await pool.query(
      `
      SELECT
        a.id,
        a.trabajador_id AS "trabajadorId",
        a.fecha,
        a.estado,
        t.id AS "t_id",
        t.nombre AS "t_nombre",
        t.especialidad AS "t_especialidad"
      FROM asistencias a
      JOIN trabajadores t ON t.id = a.trabajador_id
      ${where}
      ORDER BY a.fecha DESC, a.id DESC
      `,
      params
    );

    const data = rows.map((r) => ({
      id: r.id,
      trabajadorId: r.trabajadorId,
      fecha: r.fecha,
      estado: r.estado,
      trabajador: {
        id: r.t_id,
        nombre: r.t_nombre,
        especialidad: r.t_especialidad
      }
    }));

    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al listar asistencias" });
  }
});

// Crear asistencia
router.post("/", async (req, res) => {
  try {
    const { trabajadorId, fecha, estado } = req.body;
    const fechaFinal = fecha || fechaHoyArgentinaISO();

    if (!trabajadorId || !ESTADOS.includes(estado)) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const t = await pool.query("SELECT id FROM trabajadores WHERE id = $1", [Number(trabajadorId)]);
    if (!t.rowCount) return res.status(400).json({ error: "trabajadorId inválido" });

    const dup = await pool.query(
      "SELECT 1 FROM asistencias WHERE trabajador_id = $1 AND fecha = $2",
      [Number(trabajadorId), fechaFinal]
    );
    if (dup.rowCount) {
      return res.status(409).json({ error: "Ese trabajador ya tiene asistencia cargada en esa fecha" });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO asistencias (trabajador_id, fecha, estado)
      VALUES ($1, $2, $3)
      RETURNING id, trabajador_id AS "trabajadorId", fecha, estado
      `,
      [Number(trabajadorId), fechaFinal, estado]
    );

    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: "Error al crear asistencia" });
  }
});

module.exports = router;
