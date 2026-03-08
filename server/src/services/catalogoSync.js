const pool = require("../config/db");

const VPIC_BASE_URL = process.env.VPIC_BASE_URL || "https://vpic.nhtsa.dot.gov/api/vehicles";

function norm(txt) {
  return String(txt || "").trim();
}

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`vPIC HTTP ${r.status}`);
  return r.json();
}

async function normalizarSecuenciasCatalogo() {
  await pool.query(
    `SELECT setval('catalogo_marcas_id_seq', COALESCE((SELECT MAX(id) FROM catalogo_marcas), 1), true)`
  );
  await pool.query(
    `SELECT setval('catalogo_modelos_id_seq', COALESCE((SELECT MAX(id) FROM catalogo_modelos), 1), true)`
  );
}

async function upsertMarca(nombre) {
  const nombreN = norm(nombre);
  if (!nombreN) return null;

  const insert = await pool.query(
    `INSERT INTO catalogo_marcas (nombre)
     VALUES ($1)
     ON CONFLICT (nombre) DO NOTHING
     RETURNING id`,
    [nombreN]
  );
  if (insert.rowCount) return insert.rows[0].id;

  const existente = await pool.query(
    `SELECT id
     FROM catalogo_marcas
     WHERE nombre = $1
     LIMIT 1`,
    [nombreN]
  );
  if (existente.rowCount) return existente.rows[0].id;

  const existenteCaseInsensitive = await pool.query(
    `SELECT id
     FROM catalogo_marcas
     WHERE LOWER(nombre) = LOWER($1)
     LIMIT 1`,
    [nombreN]
  );
  return existenteCaseInsensitive.rows[0]?.id || null;
}

async function upsertModelo(marcaId, nombre) {
  const nombreN = norm(nombre);
  if (!marcaId || !nombreN) return null;

  const insert = await pool.query(
    `INSERT INTO catalogo_modelos (marca_id, nombre)
     VALUES ($1, $2)
     ON CONFLICT (marca_id, nombre) DO NOTHING
     RETURNING id`,
    [Number(marcaId), nombreN]
  );
  if (insert.rowCount) return insert.rows[0].id;

  const existente = await pool.query(
    `SELECT id
     FROM catalogo_modelos
     WHERE marca_id = $1
       AND nombre = $2
     LIMIT 1`,
    [Number(marcaId), nombreN]
  );
  if (existente.rowCount) return existente.rows[0].id;

  const existenteCaseInsensitive = await pool.query(
    `SELECT id
     FROM catalogo_modelos
     WHERE marca_id = $1
       AND LOWER(nombre) = LOWER($2)
     LIMIT 1`,
    [Number(marcaId), nombreN]
  );
  return existenteCaseInsensitive.rows[0]?.id || null;
}

async function syncMarcas() {
  await normalizarSecuenciasCatalogo();
  const data = await fetchJson(`${VPIC_BASE_URL}/GetAllMakes?format=json`);
  const results = Array.isArray(data?.Results) ? data.Results : [];

  let procesadas = 0;
  for (const m of results) {
    const id = await upsertMarca(m?.Make_Name);
    if (id) procesadas += 1;
  }

  return {
    ok: true,
    totalExternas: results.length,
    procesadas
  };
}

async function syncModelosByMarca(marcaIdLocal) {
  await normalizarSecuenciasCatalogo();
  const marca = await pool.query(
    `SELECT id, nombre
     FROM catalogo_marcas
     WHERE id = $1
     LIMIT 1`,
    [Number(marcaIdLocal)]
  );

  if (!marca.rowCount) throw new Error("Marca local no encontrada");

  const make = encodeURIComponent(marca.rows[0].nombre);
  const data = await fetchJson(`${VPIC_BASE_URL}/GetModelsForMake/${make}?format=json`);
  const results = Array.isArray(data?.Results) ? data.Results : [];

  let procesados = 0;
  for (const m of results) {
    const id = await upsertModelo(marca.rows[0].id, m?.Model_Name);
    if (id) procesados += 1;
  }

  return {
    ok: true,
    marcaId: marca.rows[0].id,
    marca: marca.rows[0].nombre,
    totalExternos: results.length,
    procesados
  };
}

async function syncFullCatalogo(limitMarcas = 20) {
  await normalizarSecuenciasCatalogo();
  const data = await fetchJson(`${VPIC_BASE_URL}/GetAllMakes?format=json`);
  const results = Array.isArray(data?.Results) ? data.Results : [];
  const subset = results.slice(0, Number(limitMarcas) || 20);

  let marcasProcesadas = 0;
  let modelosProcesados = 0;

  for (const m of subset) {
    const marcaId = await upsertMarca(m?.Make_Name);
    if (!marcaId) continue;
    marcasProcesadas += 1;

    const out = await syncModelosByMarca(marcaId);
    modelosProcesados += Number(out.procesados || 0);
  }

  return {
    ok: true,
    marcasExternasTomadas: subset.length,
    marcasProcesadas,
    modelosProcesados
  };
}

async function syncModelosAll(limitMarcas = null) {
  await normalizarSecuenciasCatalogo();

  let sql = `
    SELECT id, nombre
    FROM catalogo_marcas
    ORDER BY id
  `;
  const params = [];
  if (limitMarcas) {
    sql += " LIMIT $1";
    params.push(Number(limitMarcas));
  }

  const marcas = await pool.query(sql, params);

  let marcasProcesadas = 0;
  let modelosProcesados = 0;
  const errores = [];

  for (const m of marcas.rows) {
    try {
      const out = await syncModelosByMarca(m.id);
      marcasProcesadas += 1;
      modelosProcesados += Number(out.procesados || 0);
    } catch (e) {
      errores.push({ marcaId: m.id, marca: m.nombre, error: e.message || "error" });
    }
  }

  return {
    ok: true,
    marcasLocales: marcas.rows.length,
    marcasProcesadas,
    modelosProcesados,
    errores
  };
}

module.exports = {
  syncMarcas,
  syncModelosByMarca,
  syncFullCatalogo,
  syncModelosAll
};
