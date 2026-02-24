const express = require("express");

const authRouter = require("./routes/auth");
const clientesRouter = require("./routes/clientes");
const vehiculosRouter = require("./routes/vehiculos");
const tareasRouter = require("./routes/tareas");
const recursosRouter = require("./routes/recursos");
const asistenciasRouter = require("./routes/asistencias");
const reportesRouter = require("./routes/reportes");

const app = express();
const PORT = process.env.PORT || 4000;

// Orígenes permitidos
const allowedOrigins = [
  "http://localhost:3000",
  "https://tallercairoautomotriz-1.onrender.com",
  "https://administraciontaller.com",
  "https://www.administraciontaller.com",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(express.json());

// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/", (req, res) => {
  res.send("API Taller Cairo funcionando");
});

app.use("/api/auth", authRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/vehiculos", vehiculosRouter);
app.use("/api/tareas", tareasRouter);
app.use("/api/recursos", recursosRouter);
app.use("/api/asistencias", asistenciasRouter);
app.use("/api/reportes", reportesRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
