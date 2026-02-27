const { Router } = require("express");
const db = require("../data/db");

const router = Router();

router.get("/", (req, res) => {
  res.json(db.trabajadores);
});

module.exports = router;
