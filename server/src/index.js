const express = require("express");

// Acá importamos todas las rutas
const authRouter = require("./routes/auth");
const clientesRouter = require("./routes/clientes");
const vehiculosRouter = require("./routes/vehiculos");
const tareasRouter = require("./routes/tareas");
const recursosRouter = require("./routes/recursos");
const asistenciasRouter = require("./routes/asistencias");
const reportesRouter = require("./routes/reportes");

const app = express();
const PORT = 4000;

// Parsea JSON en body
app.use(express.json());

// CORS para permitir requests del frontend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Ruta base
app.get("/", (req, res) => {
  res.send("API Taller Cairo funcionando");
});

// Acá montamos módulos
app.use("/api/auth", authRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/vehiculos", vehiculosRouter);
app.use("/api/tareas", tareasRouter);
app.use("/api/recursos", recursosRouter);
app.use("/api/asistencias", asistenciasRouter);
app.use("/api/reportes", reportesRouter);

// Levanta servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
