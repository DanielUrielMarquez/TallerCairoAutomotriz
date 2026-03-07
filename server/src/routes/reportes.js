const { Router } = require("express");
const pool = require("../config/db");

const router = Router();

// Resumen general dashboard
router.get("/resumen", async (_req, res) => {
  try {
    const hoy = new Date().toISOString().slice(0, 10);

    const [
      cClientes,
      cVehiculos,
      cTareasAbiertas,
      cTareasEnProceso,
      cTareasCerradas,
      cTareasVencidas,
      cRecursosStockBajo
    ] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS total FROM clientes"),
      pool.query("SELECT COUNT(*)::int AS total FROM vehiculos WHERE estado IN ('en_taller', 'reingresado')"),
      pool.query("SELECT COUNT(*)::int AS total FROM tareas WHERE estado = 'abierta'"),
      pool.query("SELECT COUNT(*)::int AS total FROM tareas WHERE estado = 'en_proceso'"),
      pool.query("SELECT COUNT(*)::int AS total FROM tareas WHERE estado = 'cerrada'"),
      pool.query("SELECT COUNT(*)::int AS total FROM tareas WHERE fecha_limite < $1 AND estado <> 'cerrada'", [hoy]),
      pool.query("SELECT COUNT(*)::int AS total FROM recursos WHERE stock <= minimo")
    ]);

    res.json({
      clientes: cClientes.rows[0].total,
      vehiculosEnTaller: cVehiculos.rows[0].total,
      tareasAbiertas: cTareasAbiertas.rows[0].total,
      tareasEnProceso: cTareasEnProceso.rows[0].total,
      tareasCerradas: cTareasCerradas.rows[0].total,
      tareasVencidas: cTareasVencidas.rows[0].total,
      recursosStockBajo: cRecursosStockBajo.rows[0].total
    });
  } catch (err) {
    console.error("Resumen error:", err.message);
    res.status(500).json({ error: "Error al generar resumen" });
  }
});

module.exports = router;
