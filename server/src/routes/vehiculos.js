const { Router } = require("express");
const db = require("../data/db");

const router = Router();

router.get("/", (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  let data = db.vehiculos.map((v) => ({
    ...v,
    cliente: db.clientes.find((c) => c.id === v.clienteId) || null
  }));

  if (q) {
    data = data.filter((v) =>
      [v.patente, v.marca, v.modelo, v.cliente?.nombre || ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }

  res.json(data);
});

router.post("/", (req, res) => {
  const { clienteId, marca, modelo, patente, fechaEntrada, fechaLimite, diagnostico } = req.body;
  if (!clienteId || !marca || !modelo || !patente || !fechaEntrada || !fechaLimite) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const clienteExiste = db.clientes.some((c) => c.id === Number(clienteId));
  if (!clienteExiste) return res.status(400).json({ error: "clienteId invalido" });

  const existePatente = db.vehiculos.some((v) => v.patente.toLowerCase() === patente.toLowerCase());
  if (existePatente) return res.status(409).json({ error: "La patente ya existe" });

  const nuevo = {
    id: db.counters.vehiculo++,
    clienteId: Number(clienteId),
    marca,
    modelo,
    patente: patente.toUpperCase(),
    fechaEntrada,
    fechaLimite,
    fechaSalida: null,
    diagnostico: diagnostico || "",
    estado: "en_taller"
  };

  db.vehiculos.push(nuevo);
  res.status(201).json(nuevo);
});

router.patch("/:id/salida", (req, res) => {
  const id = Number(req.params.id);
  const vehiculo = db.vehiculos.find((v) => v.id === id);
  if (!vehiculo) return res.status(404).json({ error: "Vehiculo no encontrado" });

  vehiculo.fechaSalida = req.body.fechaSalida || new Date().toISOString().slice(0, 10);
  vehiculo.estado = "entregado";
  res.json(vehiculo);
});

module.exports = router;
