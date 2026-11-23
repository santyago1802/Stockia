
const express = require("express");
const verificarToken = require("../middleware/auth.middleware");

const {
  crearPrestamo,
  obtenerPrestamos,
  obtenerHistorialPorUsuario,
  devolverPrestamo,
} = require("../controllers/prestamo.controller");

const router = express.Router();

// Consultar préstamos
router.get(
  "/",
  verificarToken,
  obtenerPrestamos
);

// Registrar préstamo
router.post(
  "/",
  verificarToken,
  crearPrestamo
);

// Consultar historial personal para Mi perfil
router.get(
  "/historial",
  verificarToken,
  obtenerHistorialPorUsuario
);

// Devolver préstamo
router.put(
  "/:id/devolver",
  verificarToken,
  devolverPrestamo
);

module.exports = router;
