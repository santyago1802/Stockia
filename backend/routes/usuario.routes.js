const express = require("express");

const {
  obtenerUsuarios,
} = require("../controllers/usuario.controller");

const router = express.Router();

// GET /api/usuarios
router.get("/", obtenerUsuarios);

module.exports = router;