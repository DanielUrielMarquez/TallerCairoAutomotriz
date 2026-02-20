const { Router } = require("express");
const db = require("../data/db");

const router = Router();

router.get("/resumen", (req, res) => {
  const hoy = new Date().toISOString().slice(0, 10);

  const tareasVencidas = db.tareas.filter((t) => t.fechaLimite < hoy && t.estado !== "cerrada").length;
  const stockBajo = db.recursos.filter((r) => r.stock <= r.minimo).length;

  res.json({
    clientes: db.clientes.length,
    vehiculosEnTaller: db.vehiculos.filter((v) => v.estado === "en_taller").length,
    tareasAbiertas: db.tareas.filter((t) => t.estado === "abierta").length,
    tareasEnProceso: db.tareas.filter((t) => t.estado === "en_proceso").length,
    tareasCerradas: db.tareas.filter((t) => t.estado === "cerrada").length,
    tareasVencidas,
    recursosStockBajo: stockBajo
  });
});

module.exports = router;
