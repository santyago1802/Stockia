
const express = require("express");
const verificarToken = require("../middleware/auth.middleware");
const movimientoController = require("../controllers/movimiento.controller");

const router = express.Router();

// ==========================================
// VERIFICAR ROL DE COORDINADOR
// ==========================================

const verificarCoordinador = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "Coordinador") {
    return res.status(403).json({
      mensaje: "No tienes permisos para realizar esta acción",
    });
  }

  next();
};

// ==========================================
// MOVIMIENTOS GENERALES
// ==========================================

// Consultar movimientos: solo Coordinador
router.get(
  "/",
  verificarToken,
  verificarCoordinador,
  movimientoController.obtenerMovimientos
);

// Registrar entrada: solo Coordinador
router.post(
  "/entrada",
  verificarToken,
  verificarCoordinador,
  movimientoController.registrarEntrada
);

// ==========================================
// MI PERFIL
// ==========================================

// Consultar movimientos recientes del usuario autenticado
// Disponible para Coordinador e Instructor
router.get(
  "/perfil",
  verificarToken,
  movimientoController.obtenerMovimientosPorUsuario
);

module.exports = router;
