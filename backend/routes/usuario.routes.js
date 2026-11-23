const express = require("express");

const verificarRol = require("../middleware/rol.middleware");

const {
  obtenerUsuarios,
  crearUsuario,
} = require("../controllers/usuario.controller");

const router = express.Router();

// Consultar usuarios: solo Coordinador
router.get(
  "/",
  verificarRol("Coordinador"),
  obtenerUsuarios
);

// Crear usuarios: solo Coordinador
router.post(
  "/",
  verificarRol("Coordinador"),
  crearUsuario
);

module.exports = router;