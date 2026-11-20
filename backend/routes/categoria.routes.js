const express = require("express");

const verificarToken = require("../middleware/auth.middleware");

const {
  obtenerCategorias,
} = require("../controllers/categoria.controller");

const router = express.Router();

// GET /api/categorias
router.get("/", verificarToken, obtenerCategorias);

module.exports = router;