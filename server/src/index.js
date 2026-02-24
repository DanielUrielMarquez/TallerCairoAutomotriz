const express = require("express");

const authRouter = require("./routes/auth");
const clientesRouter = require("./routes/clientes");
const vehiculosRouter = require("./routes/vehiculos");
const tareasRouter = require("./routes/tareas");
const recursosRouter = require("./routes/recursos");
const asistenciasRouter = require("./routes/asistencias");
const reportesRouter = require("./routes/reportes");
const usuariosRouter = require("./routes/usuarios");


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
app.use("/api/usuarios", usuariosRouter);

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


app.use("/api/auth", authRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/vehiculos", vehiculosRouter);
app.use("/api/tareas", tareasRouter);
app.use("/api/recursos", recursosRouter);
app.use("/api/asistencias", asistenciasRouter);
app.use("/api/reportes", reportesRouter);

const path = require("node:path");

// Servir build de React
app.use(express.static(path.join(__dirname, "../../cliente/build")));

// Fallback SPA (Express 5 compatible)
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "../../cliente/build/index.html"));
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
