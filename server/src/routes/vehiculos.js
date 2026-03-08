const { Router } = require("express");
const pool = require("../config/db");

const router = Router();
const ESTADOS = ["en_taller", "reingresado", "entregado"];

// Listar vehículos + cliente, con filtro
router.get("/", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    let sql = `
      SELECT
        v.id,
        v.cliente_id AS "clienteId",
        v.marca,
        v.modelo,
        v.patente,
        v.fecha_entrada AS "fechaEntrada",
        v.fecha_limite AS "fechaLimite",
        v.fecha_salida AS "fechaSalida",
        v.estado,
        c.id AS "c_id",
        c.nombre AS "c_nombre",
        c.telefono AS "c_telefono",
        c.email AS "c_email"
      FROM vehiculos v
      JOIN clientes c ON c.id = v.cliente_id
    `;
    const params = [];

    if (q) {
      sql += `
        WHERE
          v.patente ILIKE $1 OR
          v.marca ILIKE $1 OR
          v.modelo ILIKE $1 OR
          c.nombre ILIKE $1
      `;
      params.push(`%${q}%`);
    }

    sql += ` ORDER BY v.id`;

    const { rows } = await pool.query(sql, params);

    const data = rows.map((r) => ({
      id: r.id,
      clienteId: r.clienteId,
      marca: r.marca,
      modelo: r.modelo,
      patente: r.patente,
      fechaEntrada: r.fechaEntrada,
      fechaLimite: r.fechaLimite,
      fechaSalida: r.fechaSalida,
      estado: r.estado,
      cliente: {
        id: r.c_id,
        nombre: r.c_nombre,
        telefono: r.c_telefono,
        email: r.c_email
      }
    }));

    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al listar vehículos" });
  }
});

// Crear vehículo
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { clienteId, marca, modelo, patente, fechaEntrada, fechaLimite } = req.body;

    if (!clienteId || !marca || !modelo || !patente) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const cliente = await client.query("SELECT id FROM clientes WHERE id = $1", [Number(clienteId)]);
    if (!cliente.rowCount) return res.status(400).json({ error: "clienteId inválido" });

    const existe = await client.query(
      "SELECT 1 FROM vehiculos WHERE UPPER(patente) = UPPER($1)",
      [patente]
    );
    if (existe.rowCount) return res.status(409).json({ error: "La patente ya existe" });

    const fechaEntradaFinal =
      fechaEntrada ||
      new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires"
      });
    const fechaLimiteFinal = fechaLimite || fechaEntradaFinal;

    await client.query("BEGIN");

    const marcaNormalizada = String(marca || "").trim();
    const modeloNormalizado = String(modelo || "").trim();

    let marcaCatalogo = await client.query(
      `SELECT id, nombre
       FROM catalogo_marcas
       WHERE LOWER(nombre) = LOWER($1)
       LIMIT 1`,
      [marcaNormalizada]
    );
    if (!marcaCatalogo.rowCount) {
      marcaCatalogo = await client.query(
        `INSERT INTO catalogo_marcas (nombre)
         VALUES ($1)
         RETURNING id, nombre`,
        [marcaNormalizada]
      );
    }
    const marcaId = Number(marcaCatalogo.rows[0].id);

    const modeloCatalogo = await client.query(
      `SELECT id
       FROM catalogo_modelos
       WHERE marca_id = $1
         AND LOWER(nombre) = LOWER($2)
       LIMIT 1`,
      [marcaId, modeloNormalizado]
    );
    if (!modeloCatalogo.rowCount) {
      await client.query(
        `INSERT INTO catalogo_modelos (marca_id, nombre)
         VALUES ($1, $2)`,
        [marcaId, modeloNormalizado]
      );
    }

    const insert = await client.query(
      `
      INSERT INTO vehiculos (
        cliente_id, marca, modelo, patente, fecha_entrada, fecha_limite, fecha_salida, estado
      )
      VALUES ($1, $2, $3, UPPER($4), $5, $6, NULL, 'en_taller')
      RETURNING
        id,
        cliente_id AS "clienteId",
        marca,
        modelo,
        patente,
        fecha_entrada AS "fechaEntrada",
        fecha_limite AS "fechaLimite",
        fecha_salida AS "fechaSalida",
        estado
      `,
      [Number(clienteId), marcaNormalizada, modeloNormalizado, patente, fechaEntradaFinal, fechaLimiteFinal]
    );

    await client.query("COMMIT");
    res.status(201).json(insert.rows[0]);
  } catch {
    try {
      await client.query("ROLLBACK");
    } catch {}
    res.status(500).json({ error: "Error al crear vehículo" });
  } finally {
    client.release();
  }
});

// Cambiar estado vehículo
router.patch("/:id/estado", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;

    if (!ESTADOS.includes(estado)) {
      return res.status(400).json({ error: "estado inválido" });
    }

    const existe = await pool.query("SELECT id FROM vehiculos WHERE id = $1", [id]);
    if (!existe.rowCount) return res.status(404).json({ error: "Vehículo no encontrado" });

    let sql = `
      UPDATE vehiculos
      SET estado = $1
    `;
    const params = [estado];

    if (estado === "en_taller" || estado === "reingresado") {
      sql += `, fecha_salida = NULL`;
    }

    if (estado === "entregado") {
      sql += `, fecha_salida = COALESCE(fecha_salida, CURRENT_DATE)`;
    }

    sql += `
      WHERE id = $2
      RETURNING
        id,
        cliente_id AS "clienteId",
        marca,
        modelo,
        patente,
        fecha_entrada AS "fechaEntrada",
        fecha_limite AS "fechaLimite",
        fecha_salida AS "fechaSalida",
        estado
    `;
    params.push(id);

    const { rows } = await pool.query(sql, params);
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Error al actualizar estado del vehículo" });
  }
});

module.exports = router;
