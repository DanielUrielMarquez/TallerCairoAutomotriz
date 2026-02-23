const { Router } = require("express");
const db = require("../data/db");

const router = Router();

// Resumen general para dashboard
router.get("/resumen", (req, res) => {
  const hoy = new Date().toISOString().slice(0, 10);

  const tareasVencidas = db.tareas.filter(
    (t) => t.fechaLimite < hoy && t.estado !== "cerrada"
  ).length;

  const recursosStockBajo = db.recursos.filter(
    (r) => Number(r.stock) <= Number(r.minimo)
  ).length;

  res.json({
    clientes: db.clientes.length,
    vehiculosEnTaller: db.vehiculos.filter((v) => v.estado === "en_taller" || v.estado === "reingresado").length,
    tareasAbiertas: db.tareas.filter((t) => t.estado === "abierta").length,
    tareasEnProceso: db.tareas.filter((t) => t.estado === "en_proceso").length,
    tareasCerradas: db.tareas.filter((t) => t.estado === "cerrada").length,
    tareasVencidas,
    recursosStockBajo
  });
});

module.exports = router;
