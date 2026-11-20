const express = require("express");

const verificarToken = require("../middleware/auth.middleware");
const verificarRol = require("../middleware/rol.middleware");

const {
  obtenerUsuarios,
} = require("../controllers/usuario.controller");

const router = express.Router();

// GET /api/usuarios
router.get(
  "/",
  verificarToken,
  verificarRol("Coordinador"),
  obtenerUsuarios
);

module.exports = router;