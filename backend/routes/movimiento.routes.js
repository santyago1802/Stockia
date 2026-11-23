
const express = require("express");
const verificarToken = require("../middleware/auth.middleware");
const movimientoController = require("../controllers/movimiento.controller");

const router = express.Router();

// Verificar que el usuario tenga rol de Coordinador
const verificarCoordinador = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "Coordinador") {
    return res.status(403).json({
      mensaje: "No tienes permisos para realizar esta acción",
    });
  }

  next();
};

// GET /api/movimientos
// Consultar movimientos
router.get(
  "/",
  verificarToken,
  verificarCoordinador,
  movimientoController.obtenerMovimientos
);

// POST /api/movimientos/entrada
// Registrar una entrada de inventario
router.post(
  "/entrada",
  verificarToken,
  verificarCoordinador,
  movimientoController.registrarEntrada
);

module.exports = router;
