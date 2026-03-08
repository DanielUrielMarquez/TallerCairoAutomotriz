const { Router } = require("express");
const pool = require("../config/db");

const router = Router();

router.get("/catalogo/marcas", async (req, res) => {
  try {
    const q = (req.query.q || "").trim().toLowerCase();
    if (q.length < 2) return res.json([]);
    const { rows } = await pool.query(
      `SELECT id, nombre
       FROM catalogo_marcas
       WHERE LOWER(nombre) LIKE $1 || '%'
       ORDER BY nombre
       LIMIT 20`,
      [q]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al listar marcas" });
  }
});

router.get("/catalogo/modelos", async (req, res) => {
  try {
    const marcaId = Number(req.query.marcaId || 0);
    const q = (req.query.q || "").trim().toLowerCase();

    if (!marcaId) return res.status(400).json({ error: "marcaId requerido" });
    if (q.length < 2) return res.json([]);

    const { rows } = await pool.query(
      `SELECT id, nombre
       FROM catalogo_modelos
       WHERE marca_id = $1
         AND LOWER(nombre) LIKE $2 || '%'
       ORDER BY nombre
       LIMIT 20`,
      [marcaId, q]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al listar modelos" });
  }
});

router.get("/catalogo/repuestos", async (req, res) => {
  try {
    const modeloId = Number(req.query.modeloId || 0);
    const q = (req.query.q || "").trim().toLowerCase();

    if (!modeloId) return res.status(400).json({ error: "modeloId requerido" });

    const { rows } = await pool.query(
      `SELECT
         r.id,
         r.codigo,
         r.nombre,
         r.tipo,
         r.precio_referencia AS "precioReferencia"
       FROM compat_modelo_repuesto cmr
       JOIN catalogo_repuestos r ON r.id = cmr.repuesto_id
       WHERE cmr.modelo_id = $1
         AND ($2 = '' OR LOWER(r.nombre) LIKE '%' || $2 || '%')
       ORDER BY r.nombre`,
      [modeloId, q]
    );

    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al listar repuestos compatibles" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         o.id,
         o.numero,
         o.estado,
         o.descripcion_trabajo AS "descripcionTrabajo",
         o.horas_estimadas AS "horasEstimadas",
         o.valor_hora AS "valorHora",
         o.total_mano_obra AS "totalManoObra",
         o.total_repuestos AS "totalRepuestos",
         o.total_general AS "totalGeneral",
         o.created_at AS "createdAt",
         ta.id AS "tareaId",
         c.nombre AS "clienteNombre",
         v.patente,
         t.nombre AS "trabajadorNombre"
       FROM ordenes o
       JOIN clientes c ON c.id = o.cliente_id
       JOIN vehiculos v ON v.id = o.vehiculo_id
       JOIN trabajadores t ON t.id = o.trabajador_id
       LEFT JOIN tareas ta ON ta.orden_id = o.id
       ORDER BY o.id DESC`
    );

    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al listar ordenes" });
  }
});

router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      clienteId,
      vehiculoId,
      trabajadorId,
      descripcionTrabajo,
      horasEstimadas,
      valorHora,
      repuestos = []
    } = req.body;

    if (!clienteId || !vehiculoId || !trabajadorId || !descripcionTrabajo) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const validacionVehiculoCliente = await client.query(
      `SELECT id
       FROM vehiculos
       WHERE id = $1 AND cliente_id = $2`,
      [Number(vehiculoId), Number(clienteId)]
    );
    if (!validacionVehiculoCliente.rowCount) {
      return res.status(400).json({
        error: "El vehículo seleccionado no pertenece al cliente indicado"
      });
    }

    const h = Number(horasEstimadas || 0);
    const vh = Number(valorHora || 0);
    if (h < 0 || vh < 0) {
      return res.status(400).json({ error: "Horas y valor hora deben ser >= 0" });
    }

    const totalManoObra = h * vh;
    let totalRepuestos = 0;

    for (const r of repuestos) {
      const cantidad = Number(r.cantidad || 0);
      const precioUnitario = Number(r.precioUnitario || 0);
      if (cantidad <= 0 || precioUnitario < 0 || !r.repuestoId) {
        return res.status(400).json({ error: "Items de repuestos invalidos" });
      }
      totalRepuestos += cantidad * precioUnitario;
    }

    const totalGeneral = totalManoObra + totalRepuestos;
    const numero = `OT-${Date.now()}`;

    await client.query("BEGIN");

    const orden = await client.query(
      `INSERT INTO ordenes
       (numero, cliente_id, vehiculo_id, trabajador_id, descripcion_trabajo, horas_estimadas, valor_hora, total_mano_obra, total_repuestos, total_general)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, numero, estado, total_general AS "totalGeneral"`,
      [numero, Number(clienteId), Number(vehiculoId), Number(trabajadorId), descripcionTrabajo, h, vh, totalManoObra, totalRepuestos, totalGeneral]
    );

    const fechaHoy = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires"
    });

    const tarea = await client.query(
      `INSERT INTO tareas
       (orden_id, vehiculo_id, trabajador_id, descripcion, estado, prioridad, fecha_limite, total)
       VALUES ($1, $2, $3, $4, 'abierta', 'media', $5, $6)
       RETURNING id`,
      [
        orden.rows[0].id,
        Number(vehiculoId),
        Number(trabajadorId),
        descripcionTrabajo,
        fechaHoy,
        totalGeneral
      ]
    );

    for (const r of repuestos) {
      const cantidad = Number(r.cantidad || 0);
      const precioUnitario = Number(r.precioUnitario || 0);
      const subtotal = cantidad * precioUnitario;

      await client.query(
        `INSERT INTO orden_repuestos (orden_id, repuesto_id, cantidad, precio_unitario, subtotal)
         VALUES ($1,$2,$3,$4,$5)`,
        [orden.rows[0].id, Number(r.repuestoId), cantidad, precioUnitario, subtotal]
      );

      // Consumo automatico de stock en recursos:
      // busca el recurso por nombre del repuesto del catalogo.
      const repuesto = await client.query(
        `SELECT nombre
         FROM catalogo_repuestos
         WHERE id = $1`,
        [Number(r.repuestoId)]
      );
      if (!repuesto.rowCount) {
        const err = new Error("Repuesto de catalogo inexistente");
        err.httpStatus = 400;
        throw err;
      }

      const nombreRepuesto = repuesto.rows[0].nombre;
      const recursos = await client.query(
        `SELECT id, stock
         FROM recursos
         WHERE LOWER(nombre) = LOWER($1)
           AND tipo = 'repuesto'
         ORDER BY id`,
        [nombreRepuesto]
      );

      if (!recursos.rowCount) {
        const err = new Error(
          `No existe recurso para el repuesto "${nombreRepuesto}". Cargalo en Recursos.`
        );
        err.httpStatus = 409;
        throw err;
      }

      const stockTotal = recursos.rows.reduce(
        (acc, rr) => acc + Number(rr.stock || 0),
        0
      );

      if (stockTotal < cantidad) {
        const err = new Error(
          `Stock insuficiente para "${nombreRepuesto}". Disponible: ${stockTotal}, requerido: ${cantidad}.`
        );
        err.httpStatus = 409;
        throw err;
      }

      let restante = cantidad;
      for (const rr of recursos.rows) {
        if (restante <= 0) break;
        const disponible = Number(rr.stock || 0);
        if (disponible <= 0) continue;

        const consumo = Math.min(disponible, restante);
        await client.query(
          `UPDATE recursos
           SET stock = stock - $1
           WHERE id = $2`,
          [consumo, Number(rr.id)]
        );
        restante -= consumo;
      }
    }

    await client.query("COMMIT");
    res.status(201).json({
      ...orden.rows[0],
      tareaId: tarea.rows[0]?.id
    });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err?.httpStatus) {
      return res.status(err.httpStatus).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al crear orden" });
  } finally {
    client.release();
  }
});

module.exports = router;
