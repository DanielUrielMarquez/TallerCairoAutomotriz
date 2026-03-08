const { Router } = require("express");
const {
  syncMarcas,
  syncModelosByMarca,
  syncFullCatalogo,
  syncModelosAll
} = require("../services/catalogoSync");

const router = Router();

function esAdmin(adminUser) {
  return adminUser && adminUser.rol === "administrador";
}

router.post("/sync/marcas", async (req, res) => {
  try {
    const { adminUser } = req.body || {};
    if (!esAdmin(adminUser)) {
      return res.status(403).json({ error: "Solo administrador" });
    }
    const out = await syncMarcas();
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message || "Error al sincronizar marcas" });
  }
});

router.post("/sync/modelos/:marcaId", async (req, res) => {
  try {
    const { adminUser } = req.body || {};
    if (!esAdmin(adminUser)) {
      return res.status(403).json({ error: "Solo administrador" });
    }
    const marcaId = Number(req.params.marcaId);
    if (!marcaId) return res.status(400).json({ error: "marcaId inválido" });

    const out = await syncModelosByMarca(marcaId);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message || "Error al sincronizar modelos" });
  }
});

router.post("/sync/full", async (req, res) => {
  try {
    const { adminUser, limitMarcas } = req.body || {};
    if (!esAdmin(adminUser)) {
      return res.status(403).json({ error: "Solo administrador" });
    }
    const out = await syncFullCatalogo(limitMarcas || 30);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message || "Error al sincronizar catálogo completo" });
  }
});

router.post("/sync/modelos-all", async (req, res) => {
  try {
    const { adminUser, limitMarcas } = req.body || {};
    if (!esAdmin(adminUser)) {
      return res.status(403).json({ error: "Solo administrador" });
    }
    const out = await syncModelosAll(limitMarcas || null);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message || "Error al sincronizar modelos de todas las marcas" });
  }
});

module.exports = router;
